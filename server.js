const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const useragent = require('useragent');

const app = express();
const PORT = 3000;

// In-memory storage for demo purposes
const trackingData = {};

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Generate tracking link
app.post('/generate', (req, res) => {
    const id = uuidv4();
    trackingData[id] = {
        created: new Date(),
        targetUrl: req.body.targetUrl || 'https://example.com',
        visits: []
    };
    res.json({ id });
});

// Tracking endpoint
app.get('/track/:id', (req, res) => {
    const id = req.params.id;
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const agent = useragent.parse(req.headers['user-agent']);
    
    if (trackingData[id]) {
        trackingData[id].visits.push({
            timestamp: new Date(),
            ip: ip,
            userAgent: agent.toString(),
            device: agent.device.toString(),
            os: agent.os.toString(),
            browser: agent.toAgent(),
            location: geo ? {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                timezone: geo.timezone,
                ll: geo.ll
            } : null
        });
    }
    
    res.redirect(trackingData[id].targetUrl);
});

// Get tracking data
app.get('/data/:id', (req, res) => {
    res.json(trackingData[req.params.id] || {});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
