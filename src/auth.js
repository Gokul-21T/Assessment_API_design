import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'devsecret';
const REQUIRE_AUTH = (process.env.REQUIRE_AUTH || 'false').toLowerCase() === 'true';

// Issue JWT
export function issueToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

// Middleware to protect routes
export function authRequired(req, res, next) {
  if (!REQUIRE_AUTH) return next(); // Skip auth if disabled

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
