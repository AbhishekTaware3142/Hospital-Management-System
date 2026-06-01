/**
 * HOSPITAL STATIC DATA
 * Mock data for hospital, departments, doctors, services
 */
export const HOSPITAL = {
  name: 'City Hospital',
  city: 'New Delhi, India',
  address: '12 MG Road, Central City',
  rating: 4.8,
  reviews: 128,
  departments: 14,
  specialists: 72,
  openStatus: 'Open 24/7',
  phone: '+91 98765 43210',
  website: 'www.cityhospital.in',
  highlight: 'Advanced ICU · Expert physicians · Fast emergency support',
  image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop',
}

export const DEPARTMENTS = [
  { title: 'Cardiology',    subtitle: 'Heart & vascular care',  icon: '❤️' },
  { title: 'Neurology',     subtitle: 'Brain & nervous system', icon: '🧠' },
  { title: 'Orthopedics',   subtitle: 'Bone & joint care',      icon: '🦴' },
  { title: 'Pediatrics',    subtitle: 'Child care',             icon: '👶' },
  { title: 'Dermatology',   subtitle: 'Skin & hair care',       icon: '🌿' },
  { title: 'Ophthalmology', subtitle: 'Eye care',               icon: '👁️' },
]

export const FEATURED_DOCTORS = [
  { name: 'Dr. Rajeev Sharma', title: 'Senior Cardiologist', experience: '12 Yrs', rating: 4.9 },
  { name: 'Dr. Neha Verma',    title: 'Neurologist',         experience: '10 Yrs', rating: 4.8 },
  { name: 'Dr. Amit Patel',    title: 'Orthopedic Surgeon',  experience: '9 Yrs',  rating: 4.7 },
]

export const SERVICES = [
  { label: '24/7 Emergency',       icon: '🚨' },
  { label: 'ICU & Critical Care',  icon: '🏥' },
  { label: 'Diagnostics Services', icon: '🔬' },
  { label: 'Surgery & Recovery',   icon: '🩺' },
  { label: 'Ambulance & Pharmacy', icon: '🚑' },
  { label: 'Home Care Services',   icon: '🏠' },
]

export const BILLING = [
  { id: 'INV-0081', patient: 'Ritu Sharma', amount: '₹ 1,450', status: 'Paid' },
  { id: 'INV-0082', patient: 'Amit Joshi',  amount: '₹ 2,300', status: 'Pending' },
  { id: 'INV-0083', patient: 'Sana Patel',  amount: '₹ 950',   status: 'Due' },
]

export const SETTINGS_LIST = [
  { title: 'Account Settings',      description: 'Personal information and password', icon: '👤' },
  { title: 'Notification Settings', description: 'Email and push preferences',        icon: '🔔' },
  { title: 'Privacy Settings',      description: 'Manage your privacy options',       icon: '🔒' },
  { title: 'Help & Support',        description: 'Get assistance for any issue',      icon: '💬' },
]
