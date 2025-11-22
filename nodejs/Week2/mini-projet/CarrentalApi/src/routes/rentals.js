const express = require('express');
const router = express.Router();
const rentalsController = require('../controllers/rentalsController');

router.get('/', rentalsController.listRentals);
router.get('/:id', rentalsController.getRental);
router.post('/', rentalsController.createRental);
router.put('/:id/return', rentalsController.returnRental);
router.delete('/:id/cancel', rentalsController.cancelRental);

module.exports = router;