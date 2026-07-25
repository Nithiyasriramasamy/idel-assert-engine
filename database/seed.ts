import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.analytics.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.deviceLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  // Create Demo Owner
  const owner = await prisma.user.create({
    data: {
      name: "Demo Owner",
      email: "owner@assetagent.ai",
      password: "owner123", // Hackathon fake auth plain text
      role: "OWNER",
      phone: "+91 98765 43210"
    }
  });

  // Create Demo Renter
  const renter = await prisma.user.create({
    data: {
      name: "Demo Renter",
      email: "renter@assetagent.ai",
      password: "renter123",
      role: "RENTER",
      phone: "+91 91234 56789"
    }
  });

  console.log("Seeding devices...");
  const device = await prisma.device.create({
    data: {
      serialNumber: "lock-serial-112",
      battery: 88,
      status: "ONLINE",
      temperature: 24.2,
      signal: 94
    }
  });

  console.log("Seeding assets...");
  const asset = await prisma.asset.create({
    data: {
      ownerId: owner.id,
      title: "Reserved Parking Spot Indiranagar",
      description: "Premium locked parking spot with CCTV security, secure gates, and automated IoT smart locks.",
      category: "Parking",
      images: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80",
      location: "Indiranagar, Bangalore",
      latitude: 12.9716,
      longitude: 77.5946,
      hourlyPrice: 15.0,
      dailyPrice: 120.0,
      weeklyPrice: 600.0,
      monthlyPrice: 2000.0,
      status: "AVAILABLE",
      rating: 4.8,
      deviceId: device.id
    }
  });

  console.log("Seeding device logs...");
  await prisma.deviceLog.create({
    data: {
      deviceId: device.id,
      event: "LOCKED",
      timestamp: new Date()
    }
  });

  console.log("Seeding reviews...");
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Super convenient location, smart lock unlocked instantly!",
      assetId: asset.id,
      userId: renter.id
    }
  });

  console.log("Seeding notifications...");
  await prisma.notification.create({
    data: {
      userId: owner.id,
      title: "New Space Registered",
      message: "Your spatial node Indiranagar Parking is now online on the Indian grid."
    }
  });

  console.log("Seeding analytics...");
  await prisma.analytics.create({
    data: {
      revenue: 480.0,
      bookingsCount: 4,
      occupancyRate: 82.5,
      visitorsCount: 150,
      category: "Parking"
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
