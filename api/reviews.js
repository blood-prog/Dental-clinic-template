const { list, push, requireAuth } = require('./store');

const KEY = 'asm_reviews';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const reviews = await list(KEY);
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name, category, rating, text } = body;
      if (!name || !text) {
        return res.status(400).json({ error: 'Missing required fields: name, text' });
      }
      const newReview = {
        id: Date.now(),
        name: name,
        category: category || 'Dentistry',
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
        text: text,
        createdAt: new Date().toISOString()
      };
      await push(KEY, newReview);
      return res.status(201).json(newReview);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
