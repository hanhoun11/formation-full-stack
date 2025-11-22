// rentalService.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const carService = require('./carService');
const RENTAL_PATH = path.join(__dirname, '../data/rentals.json');


function read() { return JSON.parse(fs.readFileSync(RENTAL_PATH, 'utf8')); }
function write(data) { fs.writeFileSync(RENTAL_PATH, JSON.stringify(data, null, 2)); }

function parseDate(s) { return new Date(s + 'T00:00:00'); }
function daysBetween(from, to) {
  const f = parseDate(from);
  const t = parseDate(to);
  const diff = Math.ceil((t - f) / (1000*60*60*24)); // difference in days
  return Math.max(1, diff);
}

function overlaps(aFrom, aTo, bFrom, bTo) {
  // intervals [from, to) - exclude return day
  const aF = parseDate(aFrom);
  const aT = parseDate(aTo);
  const bF = parseDate(bFrom);
  const bT = parseDate(bTo);
  return aF < bT && bF < aT;
}

exports.getAll = (filters) => {
  let rentals = read();
  if (filters.status) rentals = rentals.filter(r => r.status === filters.status);
  if (filters.carId) rentals = rentals.filter(r => r.carId === filters.carId);
  // from/to filters: optional
  if (filters.from && filters.to) {
    rentals = rentals.filter(r => overlaps(r.from, r.to, filters.from, filters.to));
  }
  return rentals;
};

exports.getById = (id) => read().find(r => r.id === id);

exports.create = (body) => {
  // validation: carId, customer.name, customer.email (basic), from, to
  if (!body.carId || !body.customer || !body.customer.name || !body.customer.email || !body.from || !body.to) throw Object.assign(new Error('Missing fields'), {status:400});
  // date validation
  const from = new Date(body.from);
  const to = new Date(body.to);
  if (isNaN(from) || isNaN(to) || from >= to) throw Object.assign(new Error('Invalid dates: from < to required'), {status:400});

  // check car exists & availability
  const car = carService.getById(body.carId);
  if (!car) throw Object.assign(new Error('Car not found'), {status:404});
  if (!car.available) throw Object.assign(new Error('Car not available'), {status:409});

  // check chevauchement with existing active rentals for same car
  const rentals = read();
  const conflict = rentals.some(r => r.carId === body.carId && r.status === 'active' && overlaps(r.from, r.to, body.from, body.to));
  if (conflict) throw Object.assign(new Error('Car already booked for these dates'), {status:409});

  // pricing
  const days = daysBetween(body.from, body.to);
  const total = Number((days * car.pricePerDay).toFixed(2));

  const newRental = {
    id: uuidv4(),
    carId: body.carId,
    customer: { name: body.customer.name, email: body.customer.email },
    from: body.from,
    to: body.to,
    days,
    dailyRate: car.pricePerDay,
    total,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  rentals.push(newRental);
  write(rentals);
  // update car.available = false
  carService.update(car.id, { available: false });
  return newRental;
};

exports.returnRental = (id) => {
  const rentals = read();
  const idx = rentals.findIndex(r => r.id === id);
  if (idx === -1) throw Object.assign(new Error('Rental not found'), {status:404});
  const r = rentals[idx];
  if (r.status !== 'active') throw Object.assign(new Error('Rental not active'), {status:409});
  r.status = 'returned';
  r.returnedAt = new Date().toISOString();
  rentals[idx] = r;
  write(rentals);
  // set car.available = true
  carService.update(r.carId, { available: true });
  return r;
};

exports.cancel = (id) => {
  const rentals = read();
  const idx = rentals.findIndex(r => r.id === id);
  if (idx === -1) throw Object.assign(new Error('Rental not found'), {status:404});
  const r = rentals[idx];
  if (r.status !== 'active') throw Object.assign(new Error('Only active rentals can be cancelled'), {status:409});
  r.status = 'cancelled';
  r.cancelledAt = new Date().toISOString();
  rentals[idx] = r;
  write(rentals);
  // make car available again
  carService.update(r.carId, { available: true });
};