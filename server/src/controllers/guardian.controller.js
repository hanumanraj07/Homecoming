const Guardian = require('../models/Guardian');

// @desc    Get user's trusted contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Guardian.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a trusted contact
// @route   POST /api/contacts
// @access  Private
const addContact = async (req, res, next) => {
  try {
    const { name, phone, email, relationship, isTrusted, isPriority } = req.body;

    const contact = await Guardian.create({
      user: req.user._id,
      name,
      phone,
      email,
      relationship,
      isTrusted,
      isPriority,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = async (req, res, next) => {
  try {
    const contact = await Guardian.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res, next) => {
  try {
    let contact = await Guardian.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    contact = await Guardian.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Guardian.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    await Guardian.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  addContact,
  getContact,
  updateContact,
  deleteContact,
};
