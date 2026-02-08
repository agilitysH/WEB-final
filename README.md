# WEB-final (AniNexus Control Deck)

Backend + lightweight frontend for anime discovery, watchlists, and reviews. The server uses Express, MongoDB, JWT auth, and external anime APIs (Jikan and MyAnimeList). A static UI is served from `/app` to exercise the API.

## Features
- JWT authentication with role support (user/admin/moderator).
- Anime search, trending, and details (Jikan or MAL provider).
- Watchlist CRUD per user with status, episodes, and score.
- Reviews CRUD with like/unlike support.
- Simple web UI at `/app` and API index at `/api`.

## Tech Stack
- Node.js + Express (ESM)
- MongoDB + Mongoose
- JWT auth
- External APIs: Jikan v4, MyAnimeList v2
- Vanilla HTML/CSS/JS frontend

## Project Structure
- `server.js` - Express app, middleware, route registration, DB bootstrap.
- `routes/` - API route definitions.
- `controllers/` - Request handlers.
- `models/` - Mongoose schemas.
- `services/` - External API integration.
- `view/` - Response shaping helpers.
- `public/` - Static frontend (served at `/app`).

## Setup
### Prerequisites
- Node.js 18+ (for native `fetch`)
- MongoDB (local or cloud)

### Environment Variables
Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=replace-with-strong-secret
JIKAN_API=https://api.jikan.moe/v4/
MAL_API=https://api.myanimelist.net/v2
MAL_CLIENT_ID=your_mal_client_id
```

Notes:
- `MAL_CLIENT_ID` is required only when using the MAL provider.
- If `MAL_CLIENT_ID` is missing, MAL requests will fail and only Jikan will work.

### Install and Run
```bash
npm install
npm start
```

Open:
- Web UI: `http://localhost:3000/app/`
- API list: `http://localhost:3000/api`
- Health route: `http://localhost:3000/`

## Authentication
Sign in returns a JWT. Provide it in headers:
- `Authorization: Bearer <token>` or
- `x-access-token: <token>`

Protected endpoints: `/api/watchlist`, `/api/reviews`, `/api/auth/me`.

## API Endpoints
Base URL: `/api`

### Auth
- `POST /api/auth/signup` - create user
- `POST /api/auth/signin` - login, returns token
- `GET /api/auth/me` - current user (auth required)

### Anime
- `GET /api/anime/search` - query by title/genre/provider
- `GET /api/anime/trending` - trending list
- `GET /api/anime/:animeId` - anime details

Query params for `/api/anime/search`:
- `title` (or `q`)
- `genre` (Jikan genre id)
- `provider` (`jikan` or `mal`)
- `orderBy` + `sort` (e.g. `orderBy=popularity&sort=asc`)

### Watchlist (auth required)
- `POST /api/watchlist`
- `GET /api/watchlist?userId=<mongoUserId>`
- `PUT /api/watchlist/:id`
- `DELETE /api/watchlist/:id`

### Reviews
- `GET /api/reviews/anime/:animeId`
- `POST /api/reviews` (auth required)
- `PUT /api/reviews/:id` (auth required)
- `DELETE /api/reviews/:id` (auth required)
- `POST /api/reviews/:id/like` (auth required)

## Data Models
- `User`: username, email, password hash, roles.
- `Watchlist`: user, animeId, title, status, episodesWatched, score.
- `Review`: user, animeId, reviewText, rating, likes.

## Frontend
Static UI lives in `public/` and is served at `/app`. It supports:
- Register/login and token persistence in local storage.
- Anime search, trending, and detail view.
- Watchlist CRUD.
- Reviews CRUD and like toggle.
