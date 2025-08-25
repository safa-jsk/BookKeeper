const env = require('./config/env');
const app = require('./app');

app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

// If you deploy to Vercel serverless later, you can:
module.exports = app;
