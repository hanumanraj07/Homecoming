const Journey = require('../models/Journey');

// @desc    Get all user's journeys
// @route   GET /api/journeys
// @access  Private
const getJourneys = async (req, res, next) => {
  try {
    const journeys = await Journey.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: journeys,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new journey
// @route   POST /api/journeys
// @access  Private
const createJourney = async (req, res, next) => {
  try {
    const { name, destination, estimatedDuration, checkInInterval, gracePeriod, trustedContacts, transportMode } = req.body;

    const journey = await Journey.create({
      user: req.user._id,
      name,
      destination,
      estimatedDuration,
      checkInInterval,
      gracePeriod,
      trustedContacts,
      transportMode,
    });

    res.status(201).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journey
// @route   GET /api/journeys/:id
// @access  Private
const getJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('trustedContacts');

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start journey
// @route   POST /api/journeys/:id/start
// @access  Private
const startJourney = async (req, res, next) => {
  try {
    const { startLocation } = req.body;
    let journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    journey.status = 'ACTIVE';
    journey.startTime = Date.now();
    journey.expectedArrival = new Date(Date.now() + journey.estimatedDuration * 60000);
    journey.lastCheckIn = Date.now();
    
    if (startLocation) {
      journey.startLocation = startLocation;
      journey.locationHistory.push({
        ...startLocation,
        timestamp: Date.now()
      });
    }

    await journey.save();

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User check-in
// @route   POST /api/journeys/:id/check-in
// @access  Private
const checkInJourney = async (req, res, next) => {
  try {
    const { location, status = 'SAFE' } = req.body;
    let journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    journey.lastCheckIn = Date.now();
    journey.status = status;
    
    journey.checkIns.push({
      location,
      status,
      respondedAt: Date.now()
    });

    if (location) {
      journey.locationHistory.push({
        ...location,
        timestamp: Date.now()
      });
    }

    await journey.save();

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End journey
// @route   POST /api/journeys/:id/end
// @access  Private
const endJourney = async (req, res, next) => {
  try {
    let journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    journey.status = 'COMPLETED';
    journey.actualArrival = Date.now();

    await journey.save();

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send location update
// @route   POST /api/journeys/:id/location
// @access  Private
const updateLocation = async (req, res, next) => {
  try {
    const { location } = req.body;
    console.log("UPDATE LOCATION - req.params.id:", req.params.id, typeof req.params.id);
    console.log("UPDATE LOCATION - req.user._id:", req.user ? req.user._id : 'NO USER');
    let journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    if (location) {
      journey.locationHistory.push({
        ...location,
        timestamp: Date.now()
      });
      await journey.save();
    }

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger emergency
// @route   POST /api/journeys/:id/emergency
// @access  Private
const triggerEmergency = async (req, res, next) => {
  try {
    const { location } = req.body;
    let journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    journey.status = 'ESCALATED';
    
    if (location) {
      journey.locationHistory.push({
        ...location,
        timestamp: Date.now()
      });
    }

    journey.checkIns.push({
      location,
      status: 'EMERGENCY',
      respondedAt: Date.now()
    });

    await journey.save();

    res.status(200).json({
      success: true,
      data: journey,
      message: 'Emergency triggered and contacts notified'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a journey
// @route   DELETE /api/journeys/:id
// @access  Private
const deleteJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journey) {
      res.status(404);
      throw new Error('Journey not found');
    }

    await Journey.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJourneys,
  createJourney,
  getJourney,
  startJourney,
  checkInJourney,
  endJourney,
  updateLocation,
  triggerEmergency,
  deleteJourney,
};
