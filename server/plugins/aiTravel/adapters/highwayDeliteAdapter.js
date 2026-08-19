const fetchVerifiedPitstops = (req, res) => {
  // Mock Highway Delite API
  res.json({
    status: 'success',
    pitstops: [
      { pitstopId: 'P1', name: 'Highway Delite Washroom & Cafe', washroomScore: 4.8, hasMechanic: true, coordinates: [13.05, 78.05] }
    ]
  });
};

module.exports = { fetchVerifiedPitstops };
