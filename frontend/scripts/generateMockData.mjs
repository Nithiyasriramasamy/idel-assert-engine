import fs from 'fs';
import path from 'path';

const CITIES = [
  'Chennai', 'Coimbatore', 'Bangalore', 'Hyderabad', 'Mumbai',
  'Delhi', 'Pune', 'Kochi', 'Madurai', 'Trichy',
  'Salem', 'Mysore', 'Vizag', 'Ahmedabad', 'Jaipur'
];

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Karan', 'Arjun', 'Sahil', 'Rashmi',
  'Priya', 'Ananya', 'Sneha', 'Meera', 'Nisha', 'Deepika', 'Kavya', 'Rahul', 'Vivek', 'Siddharth'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Iyer', 'Nair',
  'Joshi', 'Verma', 'Desai', 'Kulkarni', 'Bhatia', 'Chaudhary', 'Mishra', 'Rao'
];

const CATEGORIES = [
  'Parking', 'Rooms', 'Apartments', 'Villas', 'Shops', 'Warehouses', 'Offices',
  'Cameras', 'Laptops', 'Vehicles', 'Bikes', 'Tools', 'Storage',
  'Event Halls', 'Farm Equipment'
];

const DESCRIPTIONS = [
  "Premium space with 24/7 security.",
  "Well-maintained and ready to use.",
  "Spacious area in a prime location.",
  "Top quality equipment in excellent condition.",
  "Affordable and highly accessible.",
  "Perfect for short-term and long-term needs.",
  "Recently renovated with modern amenities."
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

function generateId(prefix, index) {
  return `${prefix}-${index.toString().padStart(4, '0')}`;
}

function generateName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

function generateEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
}

function generateAvatarUrl(name) {
  return `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`;
}

function generateImageUrl(category, idx) {
  // Using fixed realistic queries to simulate unsplash images based on categories
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(category)},${idx}`;
}

// 1. Owners
const owners = Array.from({ length: 100 }, (_, i) => {
  const name = generateName();
  return {
    id: generateId('owner', i + 1),
    name,
    email: generateEmail(name),
    city: randomItem(CITIES),
    avatarUrl: generateAvatarUrl(name)
  };
});

// 2. Renters
const renters = Array.from({ length: 200 }, (_, i) => {
  const name = generateName();
  return {
    id: generateId('renter', i + 1),
    name,
    email: generateEmail(name),
    city: randomItem(CITIES),
    avatarUrl: generateAvatarUrl(name)
  };
});

// 3. Assets
const assets = Array.from({ length: 500 }, (_, i) => {
  const category = randomItem(CATEGORIES);
  const city = randomItem(CITIES);
  const owner = randomItem(owners);
  const originalPrice = randomInt(500, 20000);
  const discountPercent = randomInt(5, 40);
  
  return {
    id: generateId('asset', i + 1),
    title: `${category} in ${city}`,
    description: `${randomItem(DESCRIPTIONS)} Located in a prime area of ${city}. Ideal for your needs.`,
    category,
    imageUrl: generateImageUrl(category, i + 1),
    location: city,
    ownerId: owner.id,
    ownerName: owner.name,
    rating: randomFloat(3.5, 5.0, 1),
    reviewCount: randomInt(0, 300),
    originalPrice,
    discountPrice: Math.round(originalPrice * (1 - discountPercent / 100)),
    hourlyPrice: Math.round(originalPrice * (1 - discountPercent / 100) / 10),
    dailyPrice: Math.round(originalPrice * (1 - discountPercent / 100)),
    dynamicPrice: null,
    isVerified: Math.random() < 0.6,
    isAiRecommended: Math.random() < 0.25,
    distanceKm: randomFloat(0.5, 20, 1),
    availability: Math.random() < 0.8 ? 'AVAILABLE' : 'RENTED',
    deviceId: Math.random() < 0.3 ? generateId('dev', i + 1) : null,
    status: 'ACTIVE'
  };
});

// 4. Bookings
const bookings = Array.from({ length: 1000 }, (_, i) => {
  const asset = randomItem(assets);
  const renter = randomItem(renters);
  const durationHours = randomInt(1, 72);
  const totalAmount = asset.hourlyPrice * durationHours;
  
  return {
    id: generateId('booking', i + 1),
    assetId: asset.id,
    renterId: renter.id,
    totalAmount,
    bookingStatus: Math.random() < 0.7 ? 'ACTIVE' : (Math.random() < 0.5 ? 'COMPLETED' : 'CANCELLED'),
    paymentStatus: 'PAID',
    startTime: new Date(Date.now() - randomInt(0, 30) * 86400000).toISOString(),
    endTime: new Date(Date.now() + randomInt(1, 30) * 86400000).toISOString(),
    accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
    agreement: "Standard auto-generated rental agreement.",
    asset: {
      title: asset.title,
      category: asset.category
    }
  };
});

// 5. Reviews
const reviews = Array.from({ length: 500 }, (_, i) => {
  const asset = randomItem(assets);
  const renter = randomItem(renters);
  const rating = randomInt(3, 5);
  
  return {
    id: generateId('review', i + 1),
    assetId: asset.id,
    renterId: renter.id,
    rating,
    comment: `Excellent ${asset.category.toLowerCase()}. Highly recommended. Owner ${asset.ownerName} was very helpful.`,
    date: new Date(Date.now() - randomInt(1, 90) * 86400000).toISOString()
  };
});

// 6. Notifications
const notifications = Array.from({ length: 100 }, (_, i) => {
  const user = Math.random() < 0.5 ? randomItem(owners) : randomItem(renters);
  
  return {
    id: generateId('notif', i + 1),
    userId: user.id,
    type: 'Update',
    message: `System update or booking notification for ${user.name}.`,
    timestamp: new Date().toISOString(),
    isRead: Math.random() < 0.5
  };
});

const outputDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'owners.json'), JSON.stringify(owners, null, 2));
fs.writeFileSync(path.join(outputDir, 'renters.json'), JSON.stringify(renters, null, 2));
fs.writeFileSync(path.join(outputDir, 'assets.json'), JSON.stringify(assets, null, 2));
fs.writeFileSync(path.join(outputDir, 'bookings.json'), JSON.stringify(bookings, null, 2));
fs.writeFileSync(path.join(outputDir, 'reviews.json'), JSON.stringify(reviews, null, 2));
fs.writeFileSync(path.join(outputDir, 'notifications.json'), JSON.stringify(notifications, null, 2));

console.log('Successfully generated massive mock data files in src/data/');
