// backend/src/server.js
const app = require('./app');
const env = require('./config/env');

const PORT = process.env.PORT || env.PORT || 5000;

// IMPORTANT on Render: bind to 0.0.0.0 and use the provided PORT
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API listening on port ${PORT}`);
});
