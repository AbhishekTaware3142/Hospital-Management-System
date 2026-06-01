/*
 * MediBook Backend Playground
 *
 * Use this file to connect to MongoDB, inspect collections, and run sample queries.
 *
 * Examples:
 *   node playground.js summary
 *   node playground.js init
 *   node playground.js sample
 *   node playground.js list
 *
 * Set MONGODB_URI in backend/.env if needed.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Medibook';
const dbName = uri.split('/').pop();
const requiredCollections = ['users', 'appointments'];

const connectDB = async () => {
  const conn = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`Connected to MongoDB: ${conn.connection.host}/${dbName}`);
  return conn;
};

const createCollections = async (db) => {
  const existing = await db.listCollections().toArray();
  const existingNames = new Set(existing.map((c) => c.name));

  for (const name of requiredCollections) {
    if (!existingNames.has(name)) {
      await db.createCollection(name);
      console.log(`Created collection: ${name}`);
    } else {
      console.log(`Collection exists: ${name}`);
    }
  }
};

const listCollections = async (db) => {
  const existing = await db.listCollections().toArray();
  console.log('Collections in database:');
  existing.forEach((c) => console.log(`- ${c.name}`));
};

const insertSampleDocs = async (db) => {
  const users = db.collection('users');
  const appointments = db.collection('appointments');

  const samplePatient = {
    name: 'Test Patient',
    phone: '9999999999',
    password: 'sample-password',
    role: 'patient',
    address: '123 Demo St',
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleDoctor = {
    name: 'Test Doctor',
    phone: '8888888888',
    password: 'sample-password',
    role: 'doctor',
    specialization: 'General Practice',
    consultationFee: 500,
    availableSlots: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM' },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM' },
    ],
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const patientResult = await users.insertOne(samplePatient);
  const doctorResult = await users.insertOne(sampleDoctor);
  console.log('Inserted sample patient and doctor.');

  const sampleAppointment = {
    patient: patientResult.insertedId,
    doctor: doctorResult.insertedId,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    timeSlot: '10:00 AM - 10:30 AM',
    status: 'scheduled',
    reason: 'Routine checkup',
    symptoms: 'Mild headache',
    fee: 500,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await appointments.insertOne(sampleAppointment);
  console.log('Inserted sample appointment.');
};

const showSummary = async (db) => {
  const users = db.collection('users');
  const appointments = db.collection('appointments');

  const counts = await Promise.all([users.countDocuments(), appointments.countDocuments()]);
  console.log(`Summary for ${dbName}:`);
  console.log(`- users: ${counts[0]}`);
  console.log(`- appointments: ${counts[1]}`);
};

const main = async () => {
  const action = process.argv[2] || 'summary';
  const conn = await connectDB();
  const db = conn.connection.db;

  try {
    switch (action) {
      case 'init':
        await createCollections(db);
        break;
      case 'list':
        await listCollections(db);
        break;
      case 'sample':
        await createCollections(db);
        await insertSampleDocs(db);
        break;
      case 'summary':
      default:
        await showSummary(db);
        break;
    }
  } catch (error) {
    console.error('Playground error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

main();
