// carsController.js
const carService = require('../services/carService');

exports.listCars = (req, res, next) => {
  try {
    const filters = req.query; // category, available, minPrice, maxPrice, q, page, limit
    const result = carService.getAll(filters);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getCar = (req, res, next) => {
  try {
    const car = carService.getById(req.params.id);
    if (!car) return res.status(404).json({status: 'error', message: 'Car not found', code: 404, timestamp: new Date().toISOString()});
    res.json(car);
  } catch (err) { next(err); }
};

exports.createCar = (req, res, next) => {
  try {
    const body = req.body;
    const created = carService.create(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.updateCar = (req, res, next) => {
  try {
    const updated = carService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
};

exports.deleteCar = (req, res, next) => {
  try {
    carService.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};