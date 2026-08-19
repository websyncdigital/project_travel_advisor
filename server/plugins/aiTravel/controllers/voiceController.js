const handleVoiceCopilotQuery = (req, res) => {
  const { query, activeRoute } = req.body;
  // Mock NLP translation
  res.json({
    status: 'success',
    action: 'search',
    parameters: {
      category: 'restaurant',
      dietary: 'vegetarian',
      maxDetourMinutes: 10
    },
    message: "I've found 2 vegetarian restaurants along your route within a 10-minute detour."
  });
};

module.exports = { handleVoiceCopilotQuery };
