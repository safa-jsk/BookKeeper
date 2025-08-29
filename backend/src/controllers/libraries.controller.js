const Library = require('../models/Library');

/**
 * GET /api/libraries/locations
 * Optional query: city
 * Returns lightweight library location data for mapping.
 */
exports.listLocations = async (req, res, next) => {
    try {
        const { city } = req.query;
        const criteria = {};
        if (city) criteria.city = { $regex: city, $options: 'i' };

        const libs = await Library.find(criteria)
            .select('name address1 address2 city zip')
            .lean();

        const locations = libs.map(lib => ({
            _id: lib._id,
            name: lib.name,
            address: `${lib.address1}${lib.address2 ? ', ' + lib.address2 : ''}, ${lib.city} ${lib.zip}`,
            city: lib.city,
            zip: lib.zip,
        }));

        res.json(locations);
    } catch (err) { next(err); }
};


