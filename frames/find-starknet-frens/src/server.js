const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const { getProfileLists, generateSHA256Hash } = require('./utils');
const { sync } = require('./sync');

const app = express();

// Use CORS for all routes
app.use(cors());

const port = 3000;

sync();
let profileList = [];

// Middleware function to log requests
const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
    next(); // Move on to the next middleware or route handler
};

// Apply the middleware globally
app.use(loggerMiddleware);

// Serve static files from the 'data' directory
app.use('/frame', express.static('public'));

// Serve static files from the 'data' directory
app.use('/data', express.static('data'));

// The request should download all the images to the 'data' directory
// NOTE: should be called periodically from a cron job
app.post('/sync', (req, res) => {
    sync();
    profileList = getProfileLists();
    res.send('OK');
});

// The request should return the URL of the next profile to be displayed
app.post('/next_profile', (req, res) => {
    if (profileList.length === 0) {
        profileList = getProfileLists();
    }

    let profile_url = `https://kakachain.xyz:3000/data/${generateSHA256Hash(profileList.pop())}.png`

    let result = `
    <html>
  <head>
    <title>Find Starknet Friends :)</title>
    <meta property="og:title" content="Find Starknet Frens" />
    <meta
      property="og:image"
      content="${profile_url}"
    />
    <meta property="fc:frame" content="vNext" />
    <meta
      property="fc:frame:image"
      content="${profile_url}"
    />
    <meta property="fc:frame:button:1" content="Find Next Fren :)" />
    <meta
      property="fc:frame:post_url"
      content="https://kakachain.xyz:3000/next_profile"
    />
  </head>
  <body>
    <h1>Starknet follow fellow builders</h1>
  </body>
</html>`;

    res.send(result);
});

if (process.env.PROD == "true") {

    const certDir = "/etc/letsencrypt/live/kakachain.xyz";

    // Read the certificate and private key
    const privateKey = fs.readFileSync(path.join(certDir, 'privkey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(certDir, 'fullchain.pem'), 'utf8');

    const credentials = { key: privateKey, cert: certificate };

    // Create an HTTPS server
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(port, () => {
        console.log(`HTTPS Server running on port ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
}
