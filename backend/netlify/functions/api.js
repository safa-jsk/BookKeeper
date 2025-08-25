// Netlify Function entry → wraps your existing Express app
const serverless = require('serverless-http');
const app = require('../../src/app'); // your current app.js export
module.exports.handler = serverless(app);
