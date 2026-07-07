module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { password } = body;

  const correct = process.env.DASHBOARD_PASSWORD || 'admin123';
  if (!password || password !== correct) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ success: true, token: 'authenticated' });
};
