import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.ts';
import Pet from '../src/models/Pet.ts';
import HealthRecord from '../src/models/HealthRecord.ts';
import Reminder from '../src/models/Reminder.ts';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

// Fake Firebase UIDs (deterministic so re-runs are idempotent)
const USERS = [
  {
    firebaseUid: 'seed-uid-alice-0001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  {
    firebaseUid: 'seed-uid-bob-0002',
    name: 'Bob Martinez',
    email: 'bob@example.com',
  },
];

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86_400_000);

async function seed() {
  await mongoose.connect(MONGO_URI!);
  console.log('Connected to MongoDB');

  // Wipe existing seed data only (keyed by seed UIDs so real data is untouched)
  const seedUids = USERS.map((u) => u.firebaseUid);
  const seedUsers = await User.find({ firebaseUid: { $in: seedUids } });
  const seedUserUids = seedUsers.map((u) => u.firebaseUid);
  const seedPets = await Pet.find({ owner: { $in: seedUserUids } });
  const seedPetIds = seedPets.map((p) => p._id);

  await Promise.all([
    Reminder.deleteMany({ pet: { $in: seedPetIds } }),
    HealthRecord.deleteMany({ pet: { $in: seedPetIds } }),
    Pet.deleteMany({ owner: { $in: seedUserUids } }),
    User.deleteMany({ firebaseUid: { $in: seedUids } }),
  ]);
  console.log('Cleared existing seed data');

  // --- Users ---
  const insertedUsers = await User.insertMany(USERS);
  const alice = insertedUsers[0]!;
  const bob = insertedUsers[1]!;
  console.log(`Created ${USERS.length} users`);

  // --- Pets ---
  const pets = await Pet.insertMany([
    // Alice's pets
    {
      owner: alice.firebaseUid,
      name: 'Bella',
      species: 'dog',
      breed: 'Golden Retriever',
      dob: new Date('2020-03-15'),
    },
    {
      owner: alice.firebaseUid,
      name: 'Whiskers',
      species: 'cat',
      breed: 'Maine Coon',
      dob: new Date('2021-07-04'),
    },
    // Bob's pets
    {
      owner: bob.firebaseUid,
      name: 'Rocky',
      species: 'dog',
      breed: 'German Shepherd',
      dob: new Date('2019-11-20'),
    },
    {
      owner: bob.firebaseUid,
      name: 'Pepper',
      species: 'rabbit',
      dob: new Date('2022-05-01'),
    },
  ]);
  console.log(`Created ${pets.length} pets`);

  const bella = pets[0]!;
  const whiskers = pets[1]!;
  const rocky = pets[2]!;
  const pepper = pets[3]!;

  // --- Health Records ---
  const records = await HealthRecord.insertMany([
    // Bella
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      type: 'vaccination',
      title: 'Rabies vaccine',
      date: daysAgo(90),
      nextDueDate: daysFromNow(275),
      notes: 'Annual rabies booster — no adverse reactions.',
    },
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      type: 'vet_visit',
      title: 'Annual wellness exam',
      date: daysAgo(60),
      notes: 'Healthy weight, teeth cleaned, heartworm negative.',
    },
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      type: 'weight',
      title: 'Weight check',
      date: daysAgo(30),
      weight: 28.5,
    },
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      type: 'medication',
      title: 'Flea & tick prevention',
      date: daysAgo(15),
      nextDueDate: daysFromNow(15),
      notes: 'NexGard applied — monthly schedule.',
    },
    // Whiskers
    {
      pet: whiskers._id,
      owner: alice.firebaseUid,
      type: 'vaccination',
      title: 'FVRCP vaccine',
      date: daysAgo(120),
      nextDueDate: daysFromNow(245),
    },
    {
      pet: whiskers._id,
      owner: alice.firebaseUid,
      type: 'grooming',
      title: 'Professional grooming',
      date: daysAgo(14),
      notes: 'Bath, brush-out, nail trim.',
    },
    {
      pet: whiskers._id,
      owner: alice.firebaseUid,
      type: 'weight',
      title: 'Weight check',
      date: daysAgo(14),
      weight: 6.2,
    },
    // Rocky
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      type: 'vet_visit',
      title: 'Hip dysplasia follow-up',
      date: daysAgo(45),
      notes: 'Mild hip dysplasia — prescribed joint supplement.',
    },
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      type: 'medication',
      title: 'Joint supplement (Cosequin)',
      date: daysAgo(45),
      nextDueDate: daysFromNow(45),
      notes: 'Daily dose with food.',
    },
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      type: 'vaccination',
      title: 'Bordetella vaccine',
      date: daysAgo(180),
      nextDueDate: daysFromNow(185),
    },
    // Pepper
    {
      pet: pepper._id,
      owner: bob.firebaseUid,
      type: 'vet_visit',
      title: 'Initial health check',
      date: daysAgo(200),
      notes: 'Healthy young rabbit — advised hay-based diet.',
    },
    {
      pet: pepper._id,
      owner: bob.firebaseUid,
      type: 'grooming',
      title: 'Nail trim',
      date: daysAgo(21),
    },
  ]);
  console.log(`Created ${records.length} health records`);

  // --- Reminders ---
  const reminders = await Reminder.insertMany([
    // Bella
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      title: 'Flea & tick — monthly dose',
      dueDate: daysFromNow(15),
      isDone: false,
    },
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      title: 'Annual rabies booster',
      dueDate: daysFromNow(275),
      isDone: false,
    },
    {
      pet: bella._id,
      owner: alice.firebaseUid,
      title: 'Heartworm test (annual)',
      dueDate: daysFromNow(305),
      isDone: false,
    },
    // Whiskers
    {
      pet: whiskers._id,
      owner: alice.firebaseUid,
      title: 'FVRCP booster',
      dueDate: daysFromNow(245),
      isDone: false,
    },
    {
      pet: whiskers._id,
      owner: alice.firebaseUid,
      title: 'Grooming appointment',
      dueDate: daysFromNow(28),
      isDone: false,
    },
    // Rocky
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      title: 'Joint supplement refill',
      dueDate: daysFromNow(45),
      isDone: false,
    },
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      title: 'Bordetella booster',
      dueDate: daysFromNow(185),
      isDone: false,
    },
    {
      pet: rocky._id,
      owner: bob.firebaseUid,
      title: 'Hip check follow-up',
      dueDate: daysFromNow(90),
      isDone: false,
    },
    // Pepper
    {
      pet: pepper._id,
      owner: bob.firebaseUid,
      title: 'Nail trim',
      dueDate: daysFromNow(21),
      isDone: false,
    },
    {
      pet: pepper._id,
      owner: bob.firebaseUid,
      title: 'Annual vet check',
      dueDate: daysFromNow(165),
      isDone: false,
    },
  ]);
  console.log(`Created ${reminders.length} reminders`);

  console.log('\nSeed complete:');
  console.log(`  Users:          ${USERS.length}`);
  console.log(`  Pets:           ${pets.length}`);
  console.log(`  Health records: ${records.length}`);
  console.log(`  Reminders:      ${reminders.length}`);
  console.log('\nSeed UIDs (use these as Bearer tokens are not real — test via /api/auth routes):');
  USERS.forEach((u) => console.log(`  ${u.name}: ${u.firebaseUid}`));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
