/**
 * SEED SCRIPT
 * Run with: node seed.js
 * ── CHANGED: passwords stored as plain text — no hashing ──
 */

require('dotenv').config();
const mongoose    = require('mongoose');
const User        = require('./models/User');
const Appointment = require('./models/Appointment');
const Hospital    = require('./models/Hospital');
const Payment     = require('./models/Payment');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Medibook';

const USERS = [
  {
    name: 'Admin User',
    phone: '9000000001', password: 'Admin123',
    role: 'Master', address: 'MediBook HQ, New Delhi',
    isVerified: true, isActive: true,
  },
  {
    name: 'Ritu Sharma',
    phone: '9999900001', password: 'Patient123',
    role: 'patient', address: '101 Health Street, New Delhi',
    isVerified: true, isActive: true,
  },
  {
    name: 'Amit Joshi',
    phone: '9999900002', password: 'Patient123',
    role: 'patient', address: '202 Care Avenue, Mumbai',
    isVerified: true, isActive: true,
  },
  {
    name: 'Sana Patel',
    phone: '9999900003', password: 'Patient123',
    role: 'patient', address: '303 Wellness Road, Pune',
    isVerified: true, isActive: true,
  },
  {
    name: 'Dr. Rajeev Sharma',
    phone: '8888800001', password: 'Doctor123',
    role: 'Docter', specialization: 'Cardiology',
    licenseNumber: 'LIC-CARD-001', experience: 12, consultationFee: 700,
    availableSlots: [
      { day: 'Monday',   startTime: '09:00 AM', endTime: '12:00 PM' },
      { day: 'Thursday', startTime: '02:00 PM', endTime: '06:00 PM' },
    ],
    isVerified: true, isActive: true,
  },
  {
    name: 'Dr. Neha Verma',
    phone: '8888800002', password: 'Doctor123',
    role: 'Docter', specialization: 'Neurology',
    licenseNumber: 'LIC-NEUR-002', experience: 10, consultationFee: 800,
    availableSlots: [
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '02:00 PM' },
      { day: 'Friday',  startTime: '09:00 AM', endTime: '01:00 PM' },
    ],
    isVerified: true, isActive: true,
  },
  {
    name: 'Dr. Amit Patel',
    phone: '8888800003', password: 'Doctor123',
    role: 'Docter', specialization: 'Orthopedics',
    licenseNumber: 'LIC-ORTH-003', experience: 9, consultationFee: 600,
    availableSlots: [
      { day: 'Wednesday', startTime: '11:00 AM', endTime: '04:00 PM' },
      { day: 'Saturday',  startTime: '09:00 AM', endTime: '12:00 PM' },
    ],
    isVerified: true, isActive: true,
  },
];

const HOSPITAL = {
  name: 'City Hospital', city: 'New Delhi, India',
  address: '12 MG Road, Central City', phone: '+91 98765 43210',
  website: 'www.cityhospital.in',
  image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop',
  rating: 4.8, reviews: 128, openStatus: 'Open 24/7',
  highlight: 'Advanced ICU · Expert physicians · Fast emergency support',
  isActive: true,
  departments: [
    { title: 'Cardiology',    subtitle: 'Heart & vascular care',  icon: '❤️' },
    { title: 'Neurology',     subtitle: 'Brain & nervous system', icon: '🧠' },
    { title: 'Orthopedics',   subtitle: 'Bone & joint care',      icon: '🦴' },
    { title: 'Pediatrics',    subtitle: 'Child care',             icon: '👶' },
    { title: 'Dermatology',   subtitle: 'Skin & hair care',       icon: '🌿' },
    { title: 'Ophthalmology', subtitle: 'Eye care',               icon: '👁️' },
    { title: 'Oncology',      subtitle: 'Cancer treatment',       icon: '🎗️' },
    { title: 'Radiology',     subtitle: 'Imaging & diagnostics',  icon: '🔬' },
  ],
  services: [
    { label: '24/7 Emergency',       icon: '🚨' },
    { label: 'ICU & Critical Care',  icon: '🏥' },
    { label: 'Diagnostics Services', icon: '🔬' },
    { label: 'Surgery & Recovery',   icon: '🩺' },
    { label: 'Ambulance & Pharmacy', icon: '🚑' },
    { label: 'Home Care Services',   icon: '🏠' },
  ],
};

async function seed() {
  await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✓ Connected to', URI);

  // Clear
  await Promise.all([
    User.deleteMany({}),
    Appointment.deleteMany({}),
    Hospital.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  console.log('✓ Cleared existing data');

  // Hospital
  await Hospital.create(HOSPITAL);
  console.log('✓ Hospital seeded');

  // Users — Mongoose pre-save hook hashes passwords automatically
  const saved = {};
  for (const u of USERS) {
    const doc = await new User(u).save();
    saved[u.phone] = doc._id;
    console.log(`  ✓ ${u.role.padEnd(8)} ${u.name}`);
  }

  // Appointments
  const now       = Date.now();
  const daysAgo   = n => new Date(now - n * 86400000);
  const daysAhead = n => new Date(now + n * 86400000);

  const appts = [
    { patient: saved['9999900001'], doctor: saved['8888800001'], appointmentDate: daysAgo(2),  timeSlot: '09:30 AM - 10:00 AM', status: 'completed', reason: 'Chest pain evaluation',    fee: 700, paymentStatus: 'completed', rating: 5, review: 'Excellent.', prescription: 'Aspirin 75mg' },
    { patient: saved['9999900002'], doctor: saved['8888800002'], appointmentDate: daysAgo(4),  timeSlot: '10:30 AM - 11:00 AM', status: 'completed', reason: 'Recurring headaches',      fee: 800, paymentStatus: 'completed', rating: 4, review: 'Very thorough.', prescription: 'Sumatriptan 50mg' },
    { patient: saved['9999900003'], doctor: saved['8888800003'], appointmentDate: daysAgo(5),  timeSlot: '11:00 AM - 11:30 AM', status: 'completed', reason: 'Knee pain follow-up',      fee: 600, paymentStatus: 'completed', rating: 5, review: 'Great advice.', prescription: 'Ibuprofen 400mg' },
    { patient: saved['9999900001'], doctor: saved['8888800002'], appointmentDate: daysAgo(7),  timeSlot: '02:00 PM - 02:30 PM', status: 'completed', reason: 'Migraine consultation',    fee: 800, paymentStatus: 'pending' },
    { patient: saved['9999900002'], doctor: saved['8888800001'], appointmentDate: daysAgo(9),  timeSlot: '09:00 AM - 09:30 AM', status: 'completed', reason: 'Blood pressure check',     fee: 700, paymentStatus: 'pending' },
    { patient: saved['9999900001'], doctor: saved['8888800003'], appointmentDate: daysAhead(3),timeSlot: '11:00 AM - 11:30 AM', status: 'scheduled', reason: 'Shoulder pain',            fee: 600, paymentStatus: 'pending' },
    { patient: saved['9999900003'], doctor: saved['8888800001'], appointmentDate: daysAhead(5),timeSlot: '09:30 AM - 10:00 AM', status: 'scheduled', reason: 'Annual cardiac checkup',   fee: 700, paymentStatus: 'pending' },
    { patient: saved['9999900002'], doctor: saved['8888800003'], appointmentDate: daysAhead(7),timeSlot: '03:00 PM - 03:30 PM', status: 'scheduled', reason: 'Post-surgery follow-up',   fee: 600, paymentStatus: 'pending' },
    { patient: saved['9999900003'], doctor: saved['8888800002'], appointmentDate: daysAgo(3),  timeSlot: '10:00 AM - 10:30 AM', status: 'cancelled', reason: 'Routine checkup',          fee: 800, paymentStatus: 'refunded', cancellationReason: 'Patient unavailable' },
    { patient: saved['9999900001'], doctor: saved['8888800001'], appointmentDate: daysAgo(35), timeSlot: '09:00 AM - 09:30 AM', status: 'completed', reason: 'Cardiac stress test',      fee: 700, paymentStatus: 'completed', rating: 4 },
    { patient: saved['9999900002'], doctor: saved['8888800002'], appointmentDate: daysAgo(40), timeSlot: '11:00 AM - 11:30 AM', status: 'completed', reason: 'Epilepsy follow-up',       fee: 800, paymentStatus: 'completed', rating: 5 },
  ];

  // Bypass appointmentDate future-only validation for historical records
  const insertedAppts = await Appointment.insertMany(appts, { timestamps: true });
  console.log(`✓ ${appts.length} appointments seeded`);

  // ── Payments ─────────────────────────────────────────────────
  // Map appointment index → inserted _id for linking
  const aId = (i) => insertedAppts[i]._id;

  const txn = (prefix, n) => `${prefix}-${String(n).padStart(8, '0')}`;

  const payments = [
    // Completed payments (match completed+paid appointments)
    {
      appointment: aId(0), patient: saved['9999900001'], doctor: saved['8888800001'],
      amount: 700, status: 'completed', method: 'UPI', gateway: 'PhonePe',
      transactionId: txn('TXN', 1001),
      notes: 'Consultation fee for chest pain evaluation',
      paidAt: daysAgo(2), createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      appointment: aId(1), patient: saved['9999900002'], doctor: saved['8888800002'],
      amount: 800, status: 'completed', method: 'Card', gateway: 'Razorpay',
      transactionId: txn('TXN', 1002),
      notes: 'Consultation fee for recurring headaches',
      paidAt: daysAgo(4), createdAt: daysAgo(4), updatedAt: daysAgo(4),
    },
    {
      appointment: aId(2), patient: saved['9999900003'], doctor: saved['8888800003'],
      amount: 600, status: 'completed', method: 'Net Banking', gateway: 'Paytm',
      transactionId: txn('TXN', 1003),
      notes: 'Consultation fee for knee pain follow-up',
      paidAt: daysAgo(5), createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      appointment: aId(9), patient: saved['9999900001'], doctor: saved['8888800001'],
      amount: 700, status: 'completed', method: 'Wallet', gateway: 'GooglePay',
      transactionId: txn('TXN', 1004),
      notes: 'Consultation fee for cardiac stress test',
      paidAt: daysAgo(35), createdAt: daysAgo(35), updatedAt: daysAgo(35),
    },
    {
      appointment: aId(10), patient: saved['9999900002'], doctor: saved['8888800002'],
      amount: 800, status: 'completed', method: 'UPI', gateway: 'Razorpay',
      transactionId: txn('TXN', 1005),
      notes: 'Consultation fee for epilepsy follow-up',
      paidAt: daysAgo(40), createdAt: daysAgo(40), updatedAt: daysAgo(40),
    },
    // Pending payments (completed appointments, payment not yet done)
    {
      appointment: aId(3), patient: saved['9999900001'], doctor: saved['8888800002'],
      amount: 800, status: 'pending', method: 'UPI', gateway: 'Razorpay',
      transactionId: null,
      notes: 'Awaiting payment for migraine consultation',
      createdAt: daysAgo(7), updatedAt: daysAgo(7),
    },
    {
      appointment: aId(4), patient: saved['9999900002'], doctor: saved['8888800001'],
      amount: 700, status: 'pending', method: 'Card', gateway: 'Razorpay',
      transactionId: null,
      notes: 'Awaiting payment for blood pressure check',
      createdAt: daysAgo(9), updatedAt: daysAgo(9),
    },
    // Refunded payment (cancelled appointment)
    {
      appointment: aId(8), patient: saved['9999900003'], doctor: saved['8888800002'],
      amount: 800, status: 'refunded', method: 'UPI', gateway: 'PhonePe',
      transactionId: txn('TXN', 1006),
      notes: 'Refund issued — appointment cancelled by patient',
      paidAt: daysAgo(6), refundedAt: daysAgo(3),
      createdAt: daysAgo(6), updatedAt: daysAgo(3),
    },
    // Failed payment attempt
    {
      appointment: aId(5), patient: saved['9999900001'], doctor: saved['8888800003'],
      amount: 600, status: 'failed', method: 'Card', gateway: 'Razorpay',
      transactionId: txn('FAIL', 2001),
      notes: 'Card declined — insufficient funds',
      createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  ];

  await Payment.insertMany(payments);
  console.log(`✓ ${payments.length} payments seeded`);

  console.log('\n════════════════════════════════════════════');
  console.log('  Seed complete. Login credentials:');
  console.log('  Admin   9000000001  Admin123');
  console.log('  Patient 9999900001  Patient123');
  console.log('  Doctor  8888800001  Doctor123');
  console.log('════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
