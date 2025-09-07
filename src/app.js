import express from 'express';
import dotenv from 'dotenv';
import { issueToken, authRequired } from './auth.js';
import { getLeaderboardCache, setLeaderboardCache, invalidateLeaderboardCache } from './cache.js';
import db, { upsertHigherStmt, getByNameStmt, topNStmt, rankOfNameStmt } from './db.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LEADERBOARD_CACHE_TTL_MS = parseInt(process.env.LEADERBOARD_CACHE_TTL_MS || '30000', 10);

// ---------------- DEMO USER CREDENTIALS ----------------
const DEMO_USER = {
  username: 'admin',
  password: 'password123'
};

// ---------------- HEALTH CHECK ----------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------------- LOGIN ----------------
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    const token = issueToken({ sub: username });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// ---------------- PROTECTED: POST /api/scores ----------------
app.post('/api/scores', authRequired, (req, res) => {
  const { traderName, score } = req.body || {};

  if (typeof traderName !== 'string' || !traderName.trim()) {
    return res.status(400).json({ error: 'traderName must be a non-empty string' });
  }

  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return res.status(400).json({ error: 'score must be a number' });
  }

  const name = traderName.trim();
  const before = getByNameStmt.get(name);

  upsertHigherStmt.run({ name, score: Math.floor(score) });
  const after = getByNameStmt.get(name);

  invalidateLeaderboardCache();

  res.status(before ? 200 : 201).json({
    traderName: after.name,
    previousScore: before ? before.score : null,
    score: after.score,
    updated: before ? after.score !== before.score : true
  });
});

// ---------------- GET /api/leaderboard ----------------
app.get('/api/leaderboard', (req, res) => {
  const cache = getLeaderboardCache();
  
  if (cache.data && cache.expiresAt > Date.now()) {
    return res.json({
      cached: true,
      ttlMs: cache.expiresAt - Date.now(),
      data: cache.data
    });
  }

  const rows = topNStmt.all(10);
  const data = rows.map((r, idx) => ({
    rank: idx + 1,
    traderName: r.name,
    score: r.score
  }));

  setLeaderboardCache(data, LEADERBOARD_CACHE_TTL_MS);

  res.json({
    cached: false,
    ttlMs: LEADERBOARD_CACHE_TTL_MS,
    data
  });
});

// ---------------- GET /api/rank/:traderName ----------------
app.get('/api/rank/:traderName', (req, res) => {
  const { traderName } = req.params;
  const row = rankOfNameStmt.get(traderName);

  if (!row) {
    return res.status(404).json({ error: 'trader not found' });
  }

  res.json({
    traderName: row.name,
    score: row.score,
    rank: row.rank
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Trader Leaderboard API running at http://localhost:${PORT}`);
});
