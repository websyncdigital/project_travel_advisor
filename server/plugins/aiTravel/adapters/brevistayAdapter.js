const fetchHourlyLodging = (req, res) => {
  // Mock Brevistay API
  res.json({
    status: 'success',
    microStays: [
      { hotelId: 'H1', name: 'Boutique Highway Rest', availableSlots: [3, 6, 12], price3Hr: 30, rating: 4.6, coordinates: [13.15, 78.15] }
    ]
  });
};

module.exports = { fetchHourlyLodging };
