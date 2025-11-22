const rentalService = require('../services/rentalService');

exports.listRentals = (req, res, next) => {
  try {
    const filters = req.query; // status, from, to, carId
    const list = rentalService.getAll(filters);
    res.json(list);
  } catch (err) { next(err); }
};

exports.getRental = (req, res, next) => {
  try {
    const r = rentalService.getById(req.params.id);
    if (!r) return res.status(404).json({status: 'error', message: 'Rental not found', code: 404, timestamp: new Date().toISOString()});
    res.json(r);
  } catch (err) { next(err); }
};

exports.createRental = (req, res, next) => {
  try {
    const created = rentalService.create(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.returnRental = (req, res, next) => {
  try {
    const returned = rentalService.returnRental(req.params.id);
    res.json(returned);
  } catch (err) { next(err); }
};

exports.cancelRental = (req, res, next) => {
  try {
    rentalService.cancel(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};