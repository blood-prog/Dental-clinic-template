const { set, requireAuth } = require('./store');

const sampleAppointments = [
  { id: 1, patient: 'Jane Doe', date: '2026-07-10', time: '09:00', service: 'Comprehensive Cleaning', phone: '(555) 123-4567', email: 'jane@example.com', status: 'confirmed', createdAt: '2026-07-01T10:00:00Z' },
  { id: 2, patient: 'John Smith', date: '2026-07-11', time: '10:30', service: 'Teeth Whitening', phone: '(555) 234-5678', email: 'john@example.com', status: 'pending', createdAt: '2026-07-02T14:00:00Z' },
  { id: 3, patient: 'Emily Johnson', date: '2026-07-12', time: '14:00', service: 'General Consultation', phone: '(555) 345-6789', email: 'emily@example.com', status: 'confirmed', createdAt: '2026-07-03T09:00:00Z' },
  { id: 4, patient: 'Michael Brown', date: '2026-07-13', time: '09:30', service: 'Invisalign', phone: '(555) 456-7890', email: 'michael@example.com', status: 'pending', createdAt: '2026-07-04T11:00:00Z' },
  { id: 5, patient: 'Sarah Wilson', date: '2026-07-14', time: '11:00', service: 'Root Canal', phone: '(555) 567-8901', email: 'sarah@example.com', status: 'completed', createdAt: '2026-06-28T16:00:00Z' },
];

const sampleVisits = [];
for (let i = 29; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const date = d.toISOString().split('T')[0];
  sampleVisits.push({ date, count: Math.floor(Math.random() * 80) + 20, unique: Math.floor(Math.random() * 50) + 10 });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    await set('asm_appointments', sampleAppointments);
    await set('asm_visits', sampleVisits);
    return res.status(200).json({ message: 'Database seeded with sample data', appointments: sampleAppointments.length, visits: sampleVisits.length });
  }
  return res.status(405).json({ error: 'Use POST' });
};
