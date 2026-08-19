const { Router } = require('express');
const { handleVoiceCopilotQuery } = require('../controllers/voiceController.js');
const { executeIsochronalSearch } = require('../controllers/spatialController.js');
const { fetchVerifiedPitstops } = require('../adapters/highwayDeliteAdapter.js');
const { fetchHourlyLodging } = require('../adapters/brevistayAdapter.js');
const { contextMiddleware } = require('../middlewares/contextMiddleware.js');

const aiTravelRouter = Router();

aiTravelRouter.use(contextMiddleware);

aiTravelRouter.post('/voice-copilot', handleVoiceCopilotQuery);
aiTravelRouter.post('/search-along-route', executeIsochronalSearch);
aiTravelRouter.post('/pitstops/verified', fetchVerifiedPitstops);
aiTravelRouter.post('/lodging/hourly', fetchHourlyLodging);

module.exports = aiTravelRouter;
