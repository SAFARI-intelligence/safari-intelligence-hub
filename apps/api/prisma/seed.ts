import {
  BookingStatus,
  PaymentProvider,
  PrismaClient,
  StorySource,
  SubscriptionTier,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.hotelPromotion.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.story.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.routeTemplate.deleteMany();
  await prisma.offlineMapPack.deleteMany();
  await prisma.park.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  const locations = await Promise.all([
    prisma.location.create({
      data: { label: "Masai Mara Core", zoneName: "Masai Mara", latitude: -1.4025, longitude: 35.1167 }
    }),
    prisma.location.create({
      data: { label: "Amboseli Wetlands", zoneName: "Amboseli", latitude: -2.6488, longitude: 37.2606 }
    }),
    prisma.location.create({
      data: { label: "Laikipia Ridge", zoneName: "Laikipia", latitude: 0.3633, longitude: 36.0893 }
    }),
    prisma.location.create({
      data: { label: "Ol Pejeta Plains", zoneName: "Ol Pejeta", latitude: 0.3019, longitude: 36.8973 }
    }),
    prisma.location.create({
      data: { label: "Tsavo Corridor", zoneName: "Tsavo", latitude: -0.0269, longitude: 37.9062 }
    }),
    prisma.location.create({
      data: { label: "Nairobi HQ", zoneName: "Nairobi", latitude: -1.286389, longitude: 36.817223 }
    })
  ]);

  const [mara, amboseli, laikipia, olPejeta, tsavo, nairobi] = locations;

  const adminUser = await prisma.user.create({
    data: {
      name: "SAFARI Admin",
      email: "admin@safari.app",
      passwordHash: "$2a$12$71Wt07s8c9ixYQ5rz3Hfbe2yVwW7Ab9/TSEuxsjjXNMTvEihQ/H7y",
      role: UserRole.ADMIN,
      subscriptionTier: SubscriptionTier.PARTNER,
      preferences: ["wildlife", "luxury"],
      homeLocationId: nairobi.id
    }
  });

  const partnerUser = await prisma.user.create({
    data: {
      name: "Mara Lodge Partner",
      email: "partner@safari.app",
      passwordHash: "$2a$12$71Wt07s8c9ixYQ5rz3Hfbe2yVwW7Ab9/TSEuxsjjXNMTvEihQ/H7y",
      role: UserRole.PARTNER,
      subscriptionTier: SubscriptionTier.PARTNER,
      preferences: ["luxury", "culture"],
      homeLocationId: mara.id
    }
  });

  const animals = await Promise.all([
    prisma.animal.create({
      data: {
        name: "Savannah King",
        species: "lion",
        description: "A dominant pride male often seen near sunrise game routes in Masai Mara.",
        heroImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1800&q=80",
        locationId: mara.id,
        metadata: { priority: 1, conservationStatus: "vulnerable" }
      }
    }),
    prisma.animal.create({
      data: {
        name: "Amboseli Giant",
        species: "elephant",
        description: "A mature tusker crossing the marsh with Kilimanjaro framing.",
        heroImage: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1800&q=80",
        locationId: amboseli.id,
        metadata: { priority: 1, conservationStatus: "endangered" }
      }
    }),
    prisma.animal.create({
      data: {
        name: "Dusk Shadow",
        species: "leopard",
        description: "A solitary leopard moving riverine trees at dusk.",
        heroImage: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=1800&q=80",
        locationId: laikipia.id,
        metadata: { priority: 2, conservationStatus: "vulnerable" }
      }
    }),
    prisma.animal.create({
      data: {
        name: "Northern Guardian",
        species: "rhino",
        description: "A black rhino in a high-security conservation corridor.",
        heroImage: "https://images.unsplash.com/photo-1557053964-937650b63311?auto=format&fit=crop&w=1800&q=80",
        locationId: olPejeta.id,
        metadata: { priority: 1, conservationStatus: "critically_endangered" }
      }
    }),
    prisma.animal.create({
      data: {
        name: "River Herd Alpha",
        species: "buffalo",
        description: "A massive buffalo herd clustering along the Tsavo channels.",
        heroImage: "https://images.unsplash.com/photo-1549366021-9f761d040a94?auto=format&fit=crop&w=1800&q=80",
        locationId: tsavo.id,
        metadata: { priority: 3, conservationStatus: "near_threatened" }
      }
    })
  ]);

  await Promise.all(
    animals.map((animal) =>
      prisma.story.create({
        data: {
          animalId: animal.id,
          title: `${animal.name} Story`,
          textContent: `Immersive guide narrative for ${animal.name} in ${animal.species} habitat.`,
          audioUrl: `https://cdn.safari.app/audio/${animal.species}.mp3`,
          source: StorySource.AI,
          languageCode: "en"
        }
      })
    )
  );

  const angama = await prisma.hotel.create({
    data: {
      name: "Angama Mara",
      description: "Ultra-premium cliffside lodge overlooking migration corridors.",
      zoneName: "Masai Mara",
      locationId: mara.id,
      currency: "USD",
      priceFrom: 980,
      rating: 4.9,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
      ],
      featured: true
    }
  });

  const oldonyo = await prisma.hotel.create({
    data: {
      name: "ol Donyo Lodge",
      description: "Boutique suites with private plunge pools and Chyulu views.",
      zoneName: "Chyulu Hills",
      locationId: amboseli.id,
      currency: "USD",
      priceFrom: 740,
      rating: 4.8,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
      ],
      featured: true
    }
  });

  await prisma.park.createMany({
    data: [
      {
        name: "Masai Mara National Reserve",
        countryCode: "KE",
        entryFee: 80,
        locationId: mara.id
      },
      {
        name: "Amboseli National Park",
        countryCode: "KE",
        entryFee: 75,
        locationId: amboseli.id
      },
      {
        name: "Tsavo East National Park",
        countryCode: "KE",
        entryFee: 70,
        locationId: tsavo.id
      }
    ]
  });

  await prisma.experience.createMany({
    data: [
      {
        title: "Sunrise Balloon Safari",
        description: "Golden-hour flight with premium bush breakfast.",
        zoneName: "Masai Mara",
        price: 520,
        locationId: mara.id
      },
      {
        title: "Private Big Five Tracker Drive",
        description: "Expert ranger-led tracking in conservation corridors.",
        zoneName: "Ol Pejeta",
        price: 390,
        locationId: olPejeta.id
      }
    ]
  });

  await prisma.subscription.createMany({
    data: [
      {
        userId: adminUser.id,
        tier: SubscriptionTier.SAFARI_PLUS,
        provider: PaymentProvider.STRIPE,
        status: "active"
      },
      {
        userId: partnerUser.id,
        tier: SubscriptionTier.PARTNER,
        provider: PaymentProvider.STRIPE,
        status: "active"
      }
    ]
  });

  await prisma.hotelPromotion.create({
    data: {
      hotelId: angama.id,
      partnerUserId: partnerUser.id,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      amountPaid: 1500,
      currency: "USD"
    }
  });

  await prisma.offlineMapPack.createMany({
    data: [
      {
        regionCode: "KE-MARA",
        name: "Masai Mara Premium Pack",
        tileUrl: "https://cdn.safari.app/maps/ke-mara-v1.mbtiles",
        sizeMb: 420,
        checksum: "mara-pack-v1"
      },
      {
        regionCode: "KE-AMBOSELI",
        name: "Amboseli Premium Pack",
        tileUrl: "https://cdn.safari.app/maps/ke-amboseli-v1.mbtiles",
        sizeMb: 290,
        checksum: "amboseli-pack-v1"
      }
    ]
  });

  await prisma.routeTemplate.createMany({
    data: [
      {
        name: "Mara Signature Arc",
        estimatedHours: 8.5,
        tags: ["lion", "luxury", "balloon"]
      },
      {
        name: "Amboseli Elephant Trail",
        estimatedHours: 7.25,
        tags: ["elephant", "photography", "sunset"]
      }
    ]
  });

  await prisma.booking.create({
    data: {
      userId: adminUser.id,
      hotelId: oldonyo.id,
      checkInDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      checkOutDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
      totalAmount: 2960,
      commissionAmount: 296,
      currency: "USD",
      status: BookingStatus.CONFIRMED
    }
  });

  await prisma.analyticsEvent.createMany({
    data: [
      { eventName: "signup", distinctId: adminUser.id, userId: adminUser.id },
      { eventName: "map_interaction", distinctId: partnerUser.id, userId: partnerUser.id },
      { eventName: "subscription_conversion", distinctId: adminUser.id, userId: adminUser.id }
    ]
  });
}

void main()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
