const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');
const auth = require('../middlewares/auth');

router.get('/', carsController.listCars);
router.get('/:id', carsController.getCar);
router.post('/', auth, carsController.createCar);
router.put('/:id', auth, carsController.updateCar);
router.delete('/:id', auth, carsController.deleteCar);

module.exports = router;