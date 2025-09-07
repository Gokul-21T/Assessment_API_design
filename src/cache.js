const cache = {
leaderboard: { data: null, expiresAt: 0 }
};


export function getLeaderboardCache() {
return cache.leaderboard;
}


export function setLeaderboardCache(data, ttlMs) {
cache.leaderboard.data = data;
cache.leaderboard.expiresAt = Date.now() + ttlMs;
}


export function invalidateLeaderboardCache() {
cache.leaderboard.data = null;
cache.leaderboard.expiresAt = 0;
}