/**
 * DATABASE SEEDER
 * Automatically populates dummy doctor profiles on startup if database is empty
 * ── CHANGED: passwords stored as plain text — no bcrypt hashing ──
 * ============================================================================
 */

const User = require('../models/User');
const { ROLES } = require('./roles');

const seedDoctors = async () => {
  try {
    // Check if there are any doctors in the database already
    const doctorCount = await User.countDocuments({ role: { $in: [ROLES.DOCTOR, 'doctor'] } });

    if (doctorCount > 0) {
      console.log('✓ Doctors already present in database. Skipping seeder.');
      return;
    }

    console.log('⚡ No doctors found. Seeding dummy doctor data...');

    const dummyDoctors = [
      {
        name: 'Dr. Rajeev Sharma',
        phone: '9876543211',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'Docter',
        licenseNumber: 'MC-12345',
        specialization: 'Cardiology',
        experience: 12,
        consultationFee: 800,
        availableSlots: [
          { day: 'Monday', startTime: '09:00 AM', endTime: '12:00 PM' },
          { day: 'Wednesday', startTime: '02:00 PM', endTime: '05:00 PM' },
        ],
        isVerified: true,
      },
      {
        name: 'Dr. Neha Verma',
        phone: '9876543212',
        password: 'password123',
        role: 'Docter',
        licenseNumber: 'MC-23456',
        specialization: 'Neurology',
        experience: 10,
        consultationFee: 1000,
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00 AM', endTime: '01:00 PM' },
          { day: 'Thursday', startTime: '03:00 PM', endTime: '06:00 PM' },
        ],
        isVerified: true,
      },
      {
        name: 'Dr. Amit Patel',
        phone: '9876543213',
        password: 'password123',
        role: 'Docter',
        licenseNumber: 'MC-34567',
        specialization: 'Orthopedics',
        experience: 9,
        consultationFee: 600,
        availableSlots: [
          { day: 'Monday', startTime: '01:00 PM', endTime: '04:00 PM' },
          { day: 'Friday', startTime: '09:00 AM', endTime: '12:00 PM' },
        ],
        isVerified: true,
      },
      {
        name: 'Dr. Priya Rao',
        phone: '9876543214',
        password: 'password123',
        role: 'Docter',
        licenseNumber: 'MC-45678',
        specialization: 'Pediatrics',
        experience: 8,
        consultationFee: 500,
        availableSlots: [
          { day: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM' },
          { day: 'Friday', startTime: '02:00 PM', endTime: '05:00 PM' },
        ],
        isVerified: true,
      },
      {
        name: 'Dr. Sanjay Gupta',
        phone: '9876543215',
        password: 'password123',
        role: 'Docter',
        licenseNumber: 'MC-56789',
        specialization: 'Dermatology',
        experience: 15,
        consultationFee: 700,
        availableSlots: [
          { day: 'Tuesday', startTime: '02:00 PM', endTime: '05:00 PM' },
          { day: 'Thursday', startTime: '09:00 AM', endTime: '12:00 PM' },
        ],
        isVerified: true,
      },
      {
        name: 'Dr. Ananya Sen',
        phone: '9876543216',
        password: 'password123',
        role: 'Docter',
        licenseNumber: 'MC-67890',
        specialization: 'Ophthalmology',
        experience: 7,
        consultationFee: 450,
        availableSlots: [
          { day: 'Monday', startTime: '10:00 AM', endTime: '01:00 PM' },
          { day: 'Wednesday', startTime: '10:00 AM', endTime: '01:00 PM' },
        ],
        isVerified: true,
      }
    ];

    // We save individually so mongoose validation & pre-save hook runs properly
    for (const doc of dummyDoctors) {
      const doctorUser = new User(doc);
      await doctorUser.save();
    }

    console.log('✓ Seeding complete! 6 dummy doctors added to database.');
  } catch (error) {
    console.error('❌ Error seeding doctor data:', error.message);
  }
};

module.exports = seedDoctors;
