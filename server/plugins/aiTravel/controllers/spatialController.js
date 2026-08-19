const executeIsochronalSearch = (req, res) => {
  const { routePolyline, maxDetourMinutes } = req.body;
  // Mock Mapbox Isochronal Search-Along-Route response
  res.json({
    status: 'success',
    landmarks: [
      { landmarkId: 'L1', name: 'Grand Toll Plaza', category: 'TOLL', coordinates: [12.9716, 77.5946], distanceFromOriginKm: 12.5 },
      { landmarkId: 'L2', name: 'Coastal Bypass Flyover', category: 'JUNCTION', coordinates: [13.0827, 80.2707], distanceFromOriginKm: 56.2 }
    ],
    venues: [
      { venueId: 'V1', name: 'Green Leaf Cafe', category: 'restaurant', rating: 4.5, detourTimeMinutes: 5, coordinates: [13.0, 78.0] },
      { venueId: 'V2', name: 'Spicy Route Diner', category: 'restaurant', rating: 4.2, detourTimeMinutes: 8, coordinates: [13.1, 78.1] }
    ]
  });
};

module.exports = { executeIsochronalSearch };
