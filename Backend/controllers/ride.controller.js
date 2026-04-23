const rideController = {
  /**
   * POST /api/ride/request
   * Saves ride to DB and returns a rideId.
   * The actual driver notification is done via socket (socketService.js).
   */
  createRide: async (req, res) => {
    try {
      const {
        passengerId,
        pickup, // { lat, lon, label }
        destination, // { lat, lon, label }
        vehicleType,
        estimatedFare,
        distance,
      } = req.body;

      const mockRide = {
        rideId: `ride_${Date.now()}`,
        passengerId,
        pickup,
        destination,
        vehicleType,
        estimatedFare,
        distance,
        status: "searching",
        createdAt: new Date().toISOString(),
      };

      res.status(201).json({ success: true, ride: mockRide });
    } catch (err) {
      console.error("createRide error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to create ride" });
    }
  },

  /**
   * PATCH /api/ride/:rideId/cancel
   * Marks ride as cancelled in DB.
   */
  cancelRide: async (req, res) => {
    try {
      const { rideId } = req.params;
      // await Ride.findByIdAndUpdate(rideId, { status: "cancelled" });
      console.log(`Ride ${rideId} cancelled`);
      res.status(200).json({ success: true, message: "Ride cancelled" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to cancel ride" });
    }
  },

  /**
   * PATCH /api/ride/:rideId/complete
   * Marks ride as completed in DB.
   */
  completeRide: async (req, res) => {
    try {
      const { rideId } = req.params;
      // await Ride.findByIdAndUpdate(rideId, { status: "completed" });
      console.log(`Ride ${rideId} completed`);
      res.status(200).json({ success: true, message: "Ride completed" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to complete ride" });
    }
  },

  /**
   * GET /api/ride/:rideId
   * Fetch ride details.
   */
  getRide: async (req, res) => {
    try {
      const { rideId } = req.params;
      // TODO: const ride = await Ride.findById(rideId);
      res.status(200).json({ success: true, rideId, status: "searching" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch ride" });
    }
  },
};

export default rideController;
