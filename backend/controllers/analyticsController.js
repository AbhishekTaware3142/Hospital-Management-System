/**
 * ANALYTICS CONTROLLER
 * Aggregates real data for Reports and Payments pages
 * =====================================================
 */

const Appointment = require('../models/Appointment');
const User        = require('../models/User');
const { ROLES }   = require('../utils/roles');

// ── Helpers ──────────────────────────────────────────────────────────────

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const startOfLastWeek = () => {
  const d = startOfWeek();
  d.setDate(d.getDate() - 7);
  return d;
};

const startOfMonth = () => {
  const d = new Date();
  d.setDate(1); d.setHours(0, 0, 0, 0);
  return d;
};

const startOfLastMonth = () => {
  const d = new Date();
  d.setDate(1); d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - 1);
  return d;
};

const pct = (curr, prev) => {
  if (prev === 0) return curr > 0 ? '+100%' : '0%';
  const diff = ((curr - prev) / prev * 100).toFixed(0);
  return diff >= 0 ? `↑ ${diff}%` : `↓ ${Math.abs(diff)}%`;
};

// ── GET /api/analytics/reports ───────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const now            = new Date();
    const thisWeekStart  = startOfWeek();
    const lastWeekStart  = startOfLastWeek();
    const thisMonthStart = startOfMonth();
    const lastMonthStart = startOfLastMonth();

    const userRole = req.user?.role;
    const userId   = req.user?.id;

    // ── DOCTOR: only their patients ───────────────────────────────────────
    if (userRole === ROLES.DOCTOR) {
      const mongoose = require('mongoose');
      const doctorId = new mongoose.Types.ObjectId(userId);
      const filter   = { doctor: doctorId };

      const [total, scheduled, completed, noShow] = await Promise.all([
        Appointment.countDocuments(filter),
        Appointment.countDocuments({ ...filter, status: 'scheduled', appointmentDate: { $gte: now } }),
        Appointment.countDocuments({ ...filter, status: 'completed' }),
        Appointment.countDocuments({ ...filter, status: 'no-show' }),
      ]);

      // This week vs last week — use appointmentDate (always set)
      const [thisWeek, lastWeek] = await Promise.all([
        Appointment.countDocuments({ ...filter, appointmentDate: { $gte: thisWeekStart } }),
        Appointment.countDocuments({ ...filter, appointmentDate: { $gte: lastWeekStart, $lt: thisWeekStart } }),
      ]);

      // Revenue earned from completed visits
      const revenueAgg = await Appointment.aggregate([
        { $match: { doctor: doctorId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]);
      const revenue = revenueAgg[0]?.total || 0;

      const recentAppointments = await Appointment.find({ ...filter, status: 'completed' })
        .sort({ appointmentDate: -1 })
        .limit(5)
        .populate('patient', 'name');

      return res.status(200).json({
        success: true,
        data: {
          role: ROLES.DOCTOR,
          stats: [
            { label: 'This Week',      value: thisWeek,  detail: `${pct(thisWeek, lastWeek)} from last week`, accent: 'teal',  icon: '📅' },
            { label: 'Upcoming',       value: scheduled, detail: 'Scheduled patients',                        accent: 'blue',  icon: '🕐' },
            { label: 'Total Earnings', value: `₹${revenue.toLocaleString('en-IN')}`, detail: 'From completed visits', accent: 'green', icon: '💰' },
          ],
          summary: [
            { label: 'Total Appointments', value: String(total) },
            { label: 'Upcoming',           value: String(scheduled) },
            { label: 'Completed',          value: String(completed) },
            { label: 'No-Show',            value: String(noShow) },
            { label: 'Total Earnings',     value: `₹${revenue.toLocaleString('en-IN')}` },
          ],
          recentAppointments,
        },
      });
    }

    // ── MASTER: full system view ──────────────────────────────────────────
    // Use appointmentDate instead of createdAt (seed data may lack createdAt)
    const [apptThisWeek, apptLastWeek] = await Promise.all([
      Appointment.countDocuments({ appointmentDate: { $gte: thisWeekStart } }),
      Appointment.countDocuments({ appointmentDate: { $gte: lastWeekStart, $lt: thisWeekStart } }),
    ]);

    // New patients — use _id timestamp (ObjectId encodes creation time, always reliable)
    const objectIdFromDate = (date) => {
      const hex = Math.floor(date.getTime() / 1000).toString(16).padStart(8, '0') + '0000000000000000';
      const mongoose = require('mongoose');
      return new mongoose.Types.ObjectId(hex);
    };

    const [patientsThisWeek, patientsLastWeek] = await Promise.all([
      User.countDocuments({ role: { $in: ['patient', ROLES.PATIENT] }, _id: { $gte: objectIdFromDate(thisWeekStart) } }),
      User.countDocuments({ role: { $in: ['patient', ROLES.PATIENT] }, _id: { $gte: objectIdFromDate(lastWeekStart), $lt: objectIdFromDate(thisWeekStart) } }),
    ]);

    // Revenue — use appointmentDate for month filter
    const [revenueThis, revenueLast] = await Promise.all([
      Appointment.aggregate([
        { $match: { status: 'completed', appointmentDate: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]),
      Appointment.aggregate([
        { $match: { status: 'completed', appointmentDate: { $gte: lastMonthStart, $lt: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]),
    ]);

    const revenueThisMonth = revenueThis[0]?.total || 0;
    const revenueLastMonth = revenueLast[0]?.total || 0;

    const [upcoming, completed, withPrescription] = await Promise.all([
      Appointment.countDocuments({ status: 'scheduled', appointmentDate: { $gte: now } }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ prescription: { $exists: true, $ne: null, $ne: '' } }),
    ]);

    const recentAppointments = await Appointment.find({ status: 'completed' })
      .sort({ appointmentDate: -1 })
      .limit(5)
      .populate('patient', 'name')
      .populate('doctor', 'name specialization');

    return res.status(200).json({
      success: true,
      data: {
        role: ROLES.MASTER,
        stats: [
          { label: 'Appointments this week', value: apptThisWeek,     detail: `${pct(apptThisWeek, apptLastWeek)} from last week`,        accent: 'teal',   icon: '📅' },
          { label: 'New Patients',           value: patientsThisWeek, detail: `${pct(patientsThisWeek, patientsLastWeek)} from last week`, accent: 'purple', icon: '👥' },
          { label: 'Revenue',                value: `₹${revenueThisMonth.toLocaleString('en-IN')}`, detail: `${pct(revenueThisMonth, revenueLastMonth)} from last month`, accent: 'green', icon: '💰' },
        ],
        summary: [
          { label: 'Upcoming follow-ups',  value: String(upcoming) },
          { label: 'Completed visits',     value: String(completed) },
          { label: 'Prescriptions issued', value: String(withPrescription) },
        ],
        recentAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
  }
};

// ── GET /api/analytics/payments ──────────────────────────────────────────
const getPayments = async (req, res) => {
  try {
    // Aggregate totals
    const [paidAgg, pendingAgg, refundedAgg] = await Promise.all([
      Appointment.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { paymentStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { paymentStatus: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalPaid    = paidAgg[0]?.total    || 0;
    const pendingCount = pendingAgg[0]?.count  || 0;
    const dueAmount    = pendingAgg[0]?.total  || 0;

    // Latest 10 invoices (most recent appointments)
    const invoices = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('patient', 'name')
      .populate('doctor',  'name specialization');

    const invoiceList = invoices.map((appt, idx) => ({
      id:      `INV-${String(appt._id).slice(-4).toUpperCase()}`,
      patient: appt.patient?.name || 'Unknown',
      doctor:  appt.doctor?.name  || 'Unknown',
      amount:  `₹${appt.fee.toLocaleString('en-IN')}`,
      fee:     appt.fee,
      status:  appt.paymentStatus === 'completed'
                 ? 'Paid'
                 : appt.paymentStatus === 'refunded'
                   ? 'Refunded'
                   : 'Pending',
      date:    appt.appointmentDate,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPaid:    `₹${totalPaid.toLocaleString('en-IN')}`,
          pendingCount,
          dueAmount:    `₹${dueAmount.toLocaleString('en-IN')}`,
        },
        invoices: invoiceList,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
  }
};

module.exports = { getReports, getPayments };
