const { get, set, list, requireAuth } = require('./store');

const VISITS_KEY = 'asm_visits';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const visits = await get(VISITS_KEY);
      const appointments = await list('asm_appointments');
      const totalAppts = appointments.length;
      const confirmed = appointments.filter(a => a.status === 'confirmed').length;
      const totalVisits = visits ? visits.reduce((s, d) => s + d.count, 0) : 0;
      const totalUnique = visits ? visits.reduce((s, d) => s + d.unique, 0) : 0;

      return res.status(200).json({
        visits: visits || [],
        totals: {
          visits: totalVisits,
          unique: totalUnique,
          appointments: totalAppts,
          confirmed
        }
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const today = new Date().toISOString().split('T')[0];
      let visits = await get(VISITS_KEY) || [];

      let dayEntry = visits.find(d => d.date === today);
      if (dayEntry) {
        dayEntry.count = (dayEntry.count || 0) + 1;
        if (body.unique) dayEntry.unique = (dayEntry.unique || 0) + 1;
      } else {
        visits.push({ date: today, count: 1, unique: body.unique ? 1 : 0 });
      }

      await set(VISITS_KEY, visits);
      return res.status(200).json({ tracked: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
