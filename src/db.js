import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();


const dbPath = process.env.DB_PATH || './leaderboard.db';
const db = new Database(dbPath);


db.pragma('journal_mode = WAL');


db.exec(`
CREATE TABLE IF NOT EXISTS traders (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL UNIQUE,
score INTEGER NOT NULL DEFAULT 0,
created_at TEXT NOT NULL DEFAULT (datetime('now')),
updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);


// Prepared statements
export const upsertHigherStmt = db.prepare(`
INSERT INTO traders (name, score)
VALUES (@name, @score)
ON CONFLICT(name) DO UPDATE SET
score = CASE WHEN excluded.score > traders.score THEN excluded.score ELSE traders.score END,
updated_at = datetime('now');
`);


export const getByNameStmt = db.prepare(`
SELECT id, name, score FROM traders WHERE name = ?;
`);


export const topNStmt = db.prepare(`
SELECT name, score FROM traders
ORDER BY score DESC, name ASC
LIMIT ?;
`);


export const rankOfNameStmt = db.prepare(`
SELECT
t.name as name,
t.score as score,
(SELECT COUNT(*) FROM traders WHERE score > t.score) + 1 AS rank
FROM traders t
WHERE t.name = ?;
`);


export default db;