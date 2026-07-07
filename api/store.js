let redis;
try {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '',
  });
} catch (e) {
  redis = null;
}

const memory = {};

function isRedisReady() {
  return redis && redis.url && redis.token;
}

async function get(key) {
  if (isRedisReady()) {
    try { return await redis.get(key); } catch (e) { /* fall through */ }
  }
  return memory[key] ?? null;
}

async function set(key, value) {
  if (isRedisReady()) {
    try { await redis.set(key, value); return; } catch (e) { /* fall through */ }
  }
  memory[key] = value;
}

async function del(key) {
  if (isRedisReady()) {
    try { await redis.del(key); return; } catch (e) { /* fall through */ }
  }
  delete memory[key];
}

async function list(key) {
  const data = await get(key);
  return Array.isArray(data) ? data : [];
}

async function push(key, item) {
  const arr = await list(key);
  arr.push(item);
  await set(key, arr);
  return arr;
}

async function update(key, id, updates) {
  const arr = await list(key);
  const idx = arr.findIndex(i => String(i.id) === String(id));
  if (idx === -1) return null;
  arr[idx] = { ...arr[idx], ...updates };
  await set(key, arr);
  return arr[idx];
}

async function remove(key, id) {
  const arr = await list(key);
  const filtered = arr.filter(i => String(i.id) !== String(id));
  await set(key, filtered);
  return filtered;
}

module.exports = { get, set, del, list, push, update, remove };
