// carService.js
// li kayqra w yktb f data JSON (simple file-based storage)
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); //pour générer des IDs uniques

// joue le role de base de données locale
const DATA_PATH = path.join(__dirname, '../data/cars.json');

function read() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function write(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

exports.getAll = (filters) => {
  let cars = read();

  
  // filters: category, available, minPrice, maxPrice, q
  if (filters.category) cars = cars.filter(c => c.category === filters.category);
  if (filters.available) cars = cars.filter(c => String(c.available) === String(filters.available));
  if (filters.minPrice) cars = cars.filter(c => c.pricePerDay >= Number(filters.minPrice));
  if (filters.maxPrice) cars = cars.filter(c => c.pricePerDay <= Number(filters.maxPrice));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    cars = cars.filter(c => c.plate.toLowerCase().includes(q) || `${c.brand} ${c.model}`.toLowerCase().includes(q));
  }

  // ----- TRI -----
  if (filters.sort) {
    const order = filters.order === 'desc' ? -1 : 1;
    cars.sort((a, b) => (a[filters.sort] > b[filters.sort] ? 1*order : -1*order));
  }

  // ----- PAGINATION -----
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || cars.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  return cars.slice(start, end);
};

exports.getById = (id) => {
  const cars = read();
  return cars.find(c => c.id === id);
};

exports.create = (body) => {
  const cars = read();
  // validation: brand, model, category ∈ {eco,sedan,suv,van}, pricePerDay>0, plate unique
  const allowed = ['eco','sedan','suv','van'];
  if (!body.brand || !body.model || !body.category || !body.plate || !body.pricePerDay) throw Object.assign(new Error('Missing fields'), {status:400});
  if (!allowed.includes(body.category)) throw Object.assign(new Error('Invalid category'), {status:400});
  if (Number(body.pricePerDay) <= 0) throw Object.assign(new Error('pricePerDay must be > 0'), {status:400});
  if (cars.some(c => c.plate === body.plate)) throw Object.assign(new Error('plate must be unique'), {status:409});

  const newCar = {
    id: uuidv4(),
    brand: body.brand,
    model: body.model,
    category: body.category,
    plate: body.plate,
    pricePerDay: Number(body.pricePerDay),
    available: body.available === undefined ? true : Boolean(body.available)
  };
  cars.push(newCar);
  write(cars);
  return newCar;
};

exports.update = (id, body) => {
  const cars = read();
  const idx = cars.findIndex(c => c.id === id);
  if (idx === -1) throw Object.assign(new Error('Car not found'), {status:404});
  // allow updating fields (plate uniqueness check)
  if (body.plate && cars.some((c,i)=>c.plate===body.plate && i!==idx)) throw Object.assign(new Error('plate must be unique'), {status:409});
  const updated = {...cars[idx], ...body};
  cars[idx] = updated;
  write(cars);
  return updated;
};

exports.remove = (id) => {
  const cars = read();
  const idx = cars.findIndex(c => c.id === id);
  if (idx === -1) throw Object.assign(new Error('Car not found'), {status:404});
  // soft-delete option: set available=false instead of remove
  // cars.splice(idx,1);
  cars[idx].available = false;
  write(cars);
};
