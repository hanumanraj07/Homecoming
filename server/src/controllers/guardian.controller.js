const Guardian = require('../models/Guardian');
const { ApiError } = require('../utils/ApiError');

async function list(req, res) {
  const guardians = await Guardian.find({ userId: req.user._id }).sort({ isPrimary: -1, name: 1 });
  res.json({ guardians });
}

async function create(req, res) {
  const { name, phone, relation, isPrimary, contactId } = req.body;
  const guardian = await Guardian.create({
    userId: req.user._id,
    name,
    phone,
    relation,
    isPrimary: Boolean(isPrimary),
    contactId: contactId ?? null,
  });
  res.status(201).json({ guardian });
}

async function update(req, res) {
  const guardian = await Guardian.findOne({ _id: req.params.id, userId: req.user._id });
  if (!guardian) {
    throw new ApiError(404, 'Guardian not found');
  }

  const { name, phone, relation, isPrimary } = req.body;
  if (name !== undefined) guardian.name = name;
  if (phone !== undefined) guardian.phone = phone;
  if (relation !== undefined) guardian.relation = relation;
  if (isPrimary !== undefined) guardian.isPrimary = isPrimary;

  await guardian.save();
  res.json({ guardian });
}

async function remove(req, res) {
  const guardian = await Guardian.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!guardian) {
    throw new ApiError(404, 'Guardian not found');
  }
  res.status(204).send();
}

module.exports = { list, create, update, remove };
