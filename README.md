# Trader Leaderboard API

## Overview

This is a simple RESTful API built with Node.js and Express that manages trader scores and generates a dynamic leaderboard. It supports JWT-based authentication and an in-memory caching layer for efficient leaderboard fetching.

## Features

* Add or update trader scores (only if the new score is higher).
* Retrieve the top 10 traders by score.
* Fetch individual trader rank and score.
* JWT-based authentication for secure endpoints.
* In-memory caching of leaderboard to improve performance.

## Demo

Watch a demo of the API in action:
👉 [Demo Link](https://drive.google.com/file/d/1tkrF8WMKTX0HIDbEf7mFZ5Q0GgZ-TX8U/view?usp=sharing)

## Setup Instructions

1. Clone the repo:

   ```bash
   git clone <repo-url>
   cd trader-leaderboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with content similar to:

   ```
   PORT=3000
   DB_PATH=./leaderboard.db
   JWT_SECRET=MySecureKey_456!
   REQUIRE_AUTH=true
   LEADERBOARD_CACHE_TTL_MS=30000
   ```

4. Run the application:

   ```bash
   npm start
   ```

## API Endpoints

### POST /login

Authenticate and get a JWT token.
Request Body:

```json
{
  "username": "admin",
  "password": "password123"
}
```

### POST /api/scores

Create/update a trader (Protected with JWT).
Headers:

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

Request Body:

```json
{
  "traderName": "Alice",
  "score": 1500
}
```

### GET /api/leaderboard

Retrieve the top 10 traders with caching.

### GET /api/rank/\:traderName

Retrieve rank and score of a specific trader.
Example:

```
GET /api/rank/Alice
```

## Development Challenges

* Handling CommonJS vs ESM imports when using `better-sqlite3`.
* Configuring JWT authentication middleware properly.
* Managing environment variables effectively.
* Setting up an in-memory cache for performance optimization.
* Deployment-related issues such as Visual Studio installation for node-gyp.
