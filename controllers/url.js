const { nanoid } = require('nanoid');// Import nanoid
const URL = require('../models/url');

async function handleGenerateNewShortURL(req, res) {
    console.log("Received request:", req.body); // Debugging
    const body = req.body;
    if (!body.url) {
        return res.status(400).send({error: 'URL is missing'});
    }
    const shortID = nanoid();
    await URL.create({
        shortID: shortID,
        redirectURL: body.url,
        visitHistory: [],
    });
    return res.json({shortID: shortID});
}


async function handleRedirectNewShortURL(req, res) {
    const shortID = req.params.shortID;
    const entry = await URL.findOneAndUpdate({
        shortID,
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now()
            },
        }
    });

    if (!entry || !entry.redirectURL) {
        return res.status(404).send({error: 'URL not found'});
    }

    res.redirect(entry.redirectURL);
}

async function handleAnalyticsURL(req, res) {
    const shortID = req.params.shortID;
    const result = await URL.findOne({shortID});
    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory
    });
}

module.exports = {
    handleGenerateNewShortURL,
    handleRedirectNewShortURL,
    handleAnalyticsURL
};
