import fs from 'fs';
import path from 'path';

const CITIES = [
  'Chennai', 'Coimbatore', 'Bangalore', 'Hyderabad', 'Mumbai',
  'Delhi', 'Pune', 'Kochi', 'Madurai', 'Trichy',
  'Salem', 'Mysore', 'Vizag', 'Ahmedabad', 'Jaipur'
];

const STATES = {
  'Chennai': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Madurai': 'Tamil Nadu',
  'Trichy': 'Tamil Nadu',
  'Salem': 'Tamil Nadu',
  'Bangalore': 'Karnataka',
  'Mysore': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Vizag': 'Andhra Pradesh',
  'Mumbai': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Delhi': 'Delhi',
  'Kochi': 'Kerala',
  'Ahmedabad': 'Gujarat',
  'Jaipur': 'Rajasthan'
};

// Generates unique first names
const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Karan', 'Arjun', 'Sahil', 'Rahul', 'Vivek', 'Siddharth',
  'Pritam', 'Yash', 'Dev', 'Manish', 'Kabir', 'Abhishek', 'Rishi', 'Ankit', 'Gaurav', 'Vikram',
  'Amit', 'Deepak', 'Sanjay', 'Rajesh', 'Anil', 'Sunil', 'Vijay', 'Alok', 'Mayank', 'Harsh',
  'Akash', 'Sandeep', 'Pranav', 'Nitin', 'Raman', 'Varun', 'Tarun', 'Naveen', 'Ashok', 'Vinay'
];

// Generates unique last names
const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Iyer', 'Nair', 'Joshi', 'Verma',
  'Desai', 'Kulkarni', 'Bhatia', 'Chaudhary', 'Mishra', 'Rao', 'Sen', 'Dutta', 'Banerjee', 'Das',
  'Pillai', 'Menon', 'Shetty', 'Hegde', 'Gowda', 'Naidu', 'Chawla', 'Kapoor', 'Malhotra', 'Mehta',
  'Shah', 'Trivedi', 'Solanki', 'Joshi', 'Rathore', 'Saxena', 'Sinha', 'Prasad', 'Pandey', 'Dubey'
];

const CATEGORIES = [
  'Parking', 'Room', 'Apartment', 'Villa', 'Warehouse', 'Office', 'Shop', 'Storage',
  'Vehicle', 'Camera', 'Laptop', 'Bike', 'Tools'
];

const UNSPLASH_IMAGES = {
  Parking: [
    'photo-1506521781263-d8422e82f27a',
    'photo-1590674899484-d5640e854abe',
    'photo-1573348722427-f1d6819fdf98',
    'photo-1616362923920-51372567c9f8',
    'photo-1518005020951-eccb494ad742'
  ],
  Room: [
    'photo-1522771739844-6a9f6d5f14af',
    'photo-1598928506311-c55ded91a20c',
    'photo-1505691938895-1758d7feb511',
    'photo-1582719508461-905c673771fd',
    'photo-1616594039964-ae9021a400a0'
  ],
  Apartment: [
    'photo-1502672260266-1c1ef2d93688',
    'photo-1493809842364-78817add7ffb',
    'photo-1545324418-cc1a3fa10c00',
    'photo-1560448204-e02f11c3d0e2',
    'photo-1522708323590-d24dbb6b0267'
  ],
  Villa: [
    'photo-1580587771525-78b9dba3b914',
    'photo-1613977257363-707ba9348227',
    'photo-1512917774080-9991f1c4c750',
    'photo-1613490493576-7fde63acd811',
    'photo-1542314831-068cd1dbfeeb'
  ],
  Warehouse: [
    'photo-1586528116311-ad8dd3c8310d',
    'photo-1601584115197-04ecc0da31d7',
    'photo-1587293852726-70cdb56c2866',
    'photo-1553413719-87587af27f61',
    'photo-1562077590-1c09930f3408'
  ],
  Office: [
    'photo-1497366216548-37526070297c',
    'photo-1497215728101-856f4ea42174',
    'photo-1524758631624-e2822e304c36',
    'photo-1504384308090-c894fdcc538d',
    'photo-1497366811353-6870744d04b2'
  ],
  Shop: [
    'photo-1441986300917-64674bd600d8',
    'photo-1472851294608-062f824d28c5',
    'photo-1528698827591-e19ccd7bc23d',
    'photo-1555529669-e69e7aa0db9a',
    'photo-1567401893414-76b7b1e5a7a5'
  ],
  Storage: [
    'photo-1590069261209-f8e9b8642343',
    'photo-1563986768609-322da13575f3',
    'photo-1504917595217-d4dc5ebe6122',
    'photo-1584622650111-993a426fbf0a',
    'photo-1600585154340-be6161a56a0c'
  ],
  Vehicle: [
    'photo-1503376780353-7e6692767b70',
    'photo-1533473359331-0135ef1b58bf',
    'photo-1549399542-7e3f8b79c341',
    'photo-1552519507-da3b142c6e3d',
    'photo-1583121274602-3e2820c69888'
  ],
  Camera: [
    'photo-1516035069371-29a1b244cc32',
    'photo-1502920917128-1fc50ed760c9',
    'photo-1510127899000-e2de34ae0f58',
    'photo-1514565131-fce0801e5785',
    'photo-1526170375885-4d8ecf77b99f'
  ],
  Laptop: [
    'photo-1496181130207-9331b810db2a',
    'photo-1588872657578-7efd1f1555ed',
    'photo-1488590528505-98d2b5aba04b',
    'photo-1517694712202-14dd9538aa97',
    'photo-1498050108023-c5249f4df085'
  ],
  Bike: [
    'photo-1485965120184-e220f721d03e',
    'photo-1532298229144-0ec0c57515c7',
    'photo-1507035895480-2b3156c31fc8',
    'photo-1571068316344-75bc76f77890',
    'photo-1558981806-ec527fa84c39'
  ],
  Tools: [
    'photo-1581244277943-fe4a9c777189',
    'photo-1504148455328-c376907d081c',
    'photo-1534224039826-c7a0dea0e66a',
    'photo-1540103711724-ebf833bde8d1',
    'photo-1581783898377-1c85bf937427'
  ]
};

const RULES = [
  "Valid Government ID required",
  "Security Deposit ₹2000",
  "Check-in 9:00 AM",
  "Check-out 7:00 PM",
  "No smoking inside the premises",
  "No illegal activities allowed",
  "Damage charges apply for any breakage",
  "Maximum capacity limits apply",
  "CCTV monitored for security purposes",
  "Refund within 48 hours of cancellation"
];

const DESCRIPTIONS = {
  Parking: "Safe, secure, and easily accessible parking space. Monitored 24/7.",
  Room: "Cozy, fully-furnished room ideal for students or working professionals.",
  Apartment: "Modern multi-room apartment equipped with premium utilities and appliances.",
  Villa: "Luxury villa with beautiful views, private gate, and spacious yards.",
  Warehouse: "High-ceiling warehouse space perfect for commercial storage and logistics.",
  Office: "Professional workspace with high-speed internet, desks, and conference area.",
  Shop: "Prime retail shop location with high footfall traffic and visibility.",
  Storage: "Clean, dry storage unit with robust security features for private belongings.",
  Vehicle: "Well-maintained economic vehicle, sanitized and ready for short or long trips.",
  Camera: "High-end DSLR camera kit including prime lenses, tripods, and carrying case.",
  Laptop: "High-performance laptop suitable for editing, coding, and business presentations.",
  Bike: "Comfortable urban bike in excellent condition for easy daily commutes.",
  Tools: "Professional toolkit containing electrical, plumbing, and carpentry handtools."
};

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

// Generates unique names to satisfy "No duplicate names"
const generatedNames = new Set();
function generateUniqueName() {
  let name = "";
  let attempts = 0;
  do {
    const fn = FIRST_NAMES[attempts % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    name = `${fn} ${ln}`;
    attempts++;
  } while (generatedNames.has(name) && attempts < 500);
  generatedNames.add(name);
  return name;
}

function generateEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
}

function generateAvatarUrl(id) {
  return `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80&sig=${id}`;
}

function generateImageUrl(category, id) {
  const pool = UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES['Room'];
  const photoId = pool[id % pool.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=600&h=400&q=80&sig=${id}`;
}

// 1. Owners
const owners = Array.from({ length: 100 }, (_, i) => {
  const name = generateUniqueName();
  const id = generateId('owner', i + 1);
  return {
    id,
    name,
    email: generateEmail(name),
    city: randomItem(CITIES),
    avatarUrl: generateAvatarUrl(id)
  };
});

// 2. Renters (different set of names)
const renters = Array.from({ length: 200 }, (_, i) => {
  const name = generateUniqueName();
  const id = generateId('renter', i + 1);
  return {
    id,
    name,
    email: generateEmail(name),
    city: randomItem(CITIES),
    avatarUrl: generateAvatarUrl(id)
  };
});

// 3. Assets
const assets = Array.from({ length: 500 }, (_, i) => {
  const category = randomItem(CATEGORIES);
  const city = randomItem(CITIES);
  const state = STATES[city];
  const owner = randomItem(owners);
  const id = generateId('asset', i + 1);
  
  // Custom pricing model
  const originalPrice = randomInt(500, 20000);
  const discountPercent = randomInt(5, 35);
  const discountPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  
  const hourlyPrice = Math.round(discountPrice / 10);
  
  const pricingTable = {
    hour_1: hourlyPrice,
    hour_3: Math.round(hourlyPrice * 2.7),
    hour_6: Math.round(hourlyPrice * 4.8),
    hour_12: Math.round(hourlyPrice * 8.5),
    day_1: discountPrice,
    day_3: Math.round(discountPrice * 2.5),
    week_1: Math.round(discountPrice * 5),
    securityDeposit: 2000,
    lateFee: 200,
    cleaningFee: 150,
    platformFee: 99
  };

  const nearby = {
    metro: `${randomFloat(0.3, 5.0)} km to nearest metro station`,
    parking: `Available on site (${randomItem(['Free', 'Paid'])} parking)`,
    busStop: `${randomFloat(0.1, 1.5)} km to bus stop`,
    hospital: `${randomFloat(0.5, 4.0)} km to emergency care`,
    restaurant: `${randomFloat(0.1, 0.8)} km to nearest dining area`,
    mall: `${randomFloat(1.0, 8.0)} km to commercial mall`,
    airportDistance: `${randomInt(5, 30)} km`
  };

  const rules = RULES.slice(0, 7 + (i % 3)); // Pick 7 to 9 random rules

  return {
    id,
    title: `${category} in ${city}`,
    description: `${DESCRIPTIONS[category]} Located in a prime area of ${city}. Ideal for your needs.`,
    category,
    imageUrl: generateImageUrl(category, i + 1),
    location: city,
    ownerId: owner.id,
    ownerName: owner.name,
    rating: randomFloat(3.8, 5.0, 1),
    reviewCount: randomInt(1, 150),
    originalPrice,
    discountPrice,
    hourlyPrice,
    dailyPrice: discountPrice,
    dynamicPrice: null,
    isVerified: Math.random() < 0.6,
    isAiRecommended: Math.random() < 0.25,
    distanceKm: randomFloat(0.5, 15, 1),
    availability: 'AVAILABLE',
    status: 'ACTIVE',
    rules,
    pricingTable,
    nearby,
    area: `${randomInt(80, 2500)} sq ft`,
    pinCode: `${randomInt(110001, 800000)}`,
    city,
    state
  };
});

// 4. Bookings
const bookings = Array.from({ length: 1000 }, (_, i) => {
  const asset = randomItem(assets);
  const renter = randomItem(renters);
  const durationHours = randomItem([1, 3, 6, 12, 24, 72, 168]);
  
  let totalAmount = 0;
  if (durationHours === 1) totalAmount = asset.pricingTable.hour_1;
  else if (durationHours === 3) totalAmount = asset.pricingTable.hour_3;
  else if (durationHours === 6) totalAmount = asset.pricingTable.hour_6;
  else if (durationHours === 12) totalAmount = asset.pricingTable.hour_12;
  else if (durationHours === 24) totalAmount = asset.pricingTable.day_1;
  else if (durationHours === 72) totalAmount = asset.pricingTable.day_3;
  else totalAmount = asset.pricingTable.week_1;

  totalAmount += asset.pricingTable.platformFee + asset.pricingTable.cleaningFee;
  
  const id = generateId('booking', i + 1);

  return {
    id,
    assetId: asset.id,
    renterId: renter.id,
    totalAmount,
    bookingStatus: Math.random() < 0.75 ? 'ACTIVE' : (Math.random() < 0.6 ? 'COMPLETED' : 'CANCELLED'),
    paymentStatus: 'PAID',
    startTime: new Date(Date.now() - randomInt(0, 30) * 86400000).toISOString(),
    endTime: new Date(Date.now() + randomInt(1, 10) * 86400000).toISOString(),
    accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
    agreement: `Standard auto-generated rental agreement for ${asset.title}.`,
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
  const rating = randomInt(4, 5);
  
  return {
    id: generateId('review', i + 1),
    assetId: asset.id,
    renterId: renter.id,
    rating,
    comment: `Excellent ${asset.category.toLowerCase()} experience. Location in ${asset.city} is highly convenient. Owner ${asset.ownerName} was responsive.`,
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
    message: `Notifications updates for user ${user.name}.`,
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
