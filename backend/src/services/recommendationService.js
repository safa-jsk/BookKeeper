// backend/services/recommendationService.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

class RecommendationService {
    constructor() {
        this.recommendations = null;
        this.titles = null;
        this.idMapping = null; // { titleToRecId, recIdToDbId, dbIdToRecId }
        this.loadModels();
    }

    async loadModels() {
        try {
            const recIndexPath = path.join(__dirname, '../rec_index.json'); // or ../rec_books.json if you prefer
            if (!fs.existsSync(recIndexPath)) {
                console.warn('Recommendation index file not found. AI recommendations will be disabled.');
                return;
            }
            const data = JSON.parse(fs.readFileSync(recIndexPath, 'utf8'));
            this.recommendations = data.neighbors; // { "0": [ {i,s}, ... ], ... }
            this.titles = data.titles;             // { "0": "Title", ... }
            console.log('AI Recommendation models loaded successfully');
            console.log(`Loaded ${Object.keys(this.recommendations).length} book recommendations`);
        } catch (error) {
            console.error('Error loading recommendation models:', error);
            this.recommendations = null;
            this.titles = null;
        }
    }

    _normTitle(t) {
        return (t || '').toString().trim().toLowerCase();
    }

    async createIdMapping() {
        if (this.idMapping) return this.idMapping;

        try {
            const Book = require('../models/Book');
            // pull title + _id (optionally author if you want stricter matching)
            const books = await Book.find({}).select('title _id').lean();

            // Build an inverse map once: title -> recId
            const titleToRecId = {};
            for (const [recId, recTitle] of Object.entries(this.titles || {})) {
                titleToRecId[this._normTitle(recTitle)] = recId;
            }

            const recIdToDbId = {};
            const dbIdToRecId = {};

            for (const b of books) {
                const key = this._normTitle(b.title);
                const recId = titleToRecId[key];
                if (recId != null) {
                    const dbId = String(b._id);
                    recIdToDbId[recId] = dbId;
                    dbIdToRecId[dbId] = recId;
                }
            }

            this.idMapping = { titleToRecId, recIdToDbId, dbIdToRecId };
            console.log(`Created ID mapping for ${Object.keys(recIdToDbId).length} books`);
            return this.idMapping;
        } catch (error) {
            console.error('Error creating ID mapping:', error);
            return null;
        }
    }

    async convertDbIdsToRecIds(dbBookIds) {
        await this.createIdMapping();
        if (!this.idMapping) return [];
        return (dbBookIds || [])
            .map(x => String(x))                       // normalize
            .map(dbId => this.idMapping.dbIdToRecId[dbId])
            .filter(Boolean);
    }

    async convertRecIdsToDbIds(recIds) {
        await this.createIdMapping();
        if (!this.idMapping) return [];
        return (recIds || [])
            .map(x => String(x))
            .map(recId => this.idMapping.recIdToDbId[recId])
            .filter(Boolean);
    }

    getRecommendations(finishedRecIds, limit = 10) {
        if (!this.recommendations || !finishedRecIds || finishedRecIds.length === 0) {
            console.log('No recommendations available or no finished books');
            return [];
        }

        console.log(`Getting recommendations for ${finishedRecIds.length} finished books`);
        const finishedSet = new Set(finishedRecIds.map(String));
        const bookScores = new Map();

        for (const recId of finishedRecIds) {
            const recIdStr = String(recId);
            const similar = this.recommendations[recIdStr];
            if (!similar) continue;

            for (const s of similar) {
                const candidate = String(s.i);
                if (finishedSet.has(candidate)) continue; // skip already finished
                bookScores.set(candidate, (bookScores.get(candidate) || 0) + (s.s || 0));
            }
        }

        return Array.from(bookScores.entries())
            .map(([recId, score]) => ({ recId, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // 🚫 IMPORTANT: never return recId as a Mongo _id
    async getRecommendationsWithDetails(finishedDbIds, limit = 10) {
        // 1) DB -> rec indices
        const finishedRecIds = await this.convertDbIdsToRecIds(finishedDbIds);
        if (finishedRecIds.length === 0) {
            console.log('No matching books found in recommendation data');
            return [];
        }

        // 2) score neighbors (grab a few extra to allow filtering)
        const scored = this.getRecommendations(finishedRecIds, Math.max(limit * 2, limit));

        // 3) rec indices -> DB ids, filter out ones not in DB
        await this.createIdMapping();
        const out = [];
        for (const { recId, score } of scored) {
            const dbId = this.idMapping.recIdToDbId[String(recId)];
            if (!dbId) continue; // skip if not mapped to DB
            const title = this.titles ? this.titles[String(recId)] : 'Unknown Title';
            out.push({
                dbId,              // MongoDB ObjectId string
                recId: String(recId),
                score,
                confidence: `${Math.min(score * 100, 100).toFixed(1)}%`,
                title
            });
            if (out.length >= limit) break;
        }

        console.log(`Generated ${out.length} recommendations`);
        return out;
    }
}

module.exports = new RecommendationService();
