const { list, push, update, remove, requireAuth } = require('./store');

const KEY = 'asm_appointments';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const appointments = await list(KEY);
      return res.status(200).json(appointments);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { patient, date, time, service, phone, email } = body;
      if (!patient || !date || !time || !service) {
        return res.status(400).json({ error: 'Missing required fields: patient, date, time, service' });
      }
      const appointments = await list(KEY);
      const newAppt = {
        id: Date.now(),
        patient,
        date,
        time,
        service: service || 'General Consultation',
        phone: phone || '',
        email: email || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      appointments.push(newAppt);
      await push(KEY, newAppt);
      return res.status(201).json(newAppt);
    }

    if (req.method === 'PATCH') {
      if (!requireAuth(req, res)) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { id, status } = body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing id or status' });
      }
      const updated = await update(KEY, id, { status });
      if (!updated) return res.status(404).json({ error: 'Appointment not found' });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const { id } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await remove(KEY, id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
