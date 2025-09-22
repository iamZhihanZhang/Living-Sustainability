# Installation

Follow these steps to install and run the server locally:

1. Install dependencies: run `npm install` in the project root.
2. Configure environment variables:

- Option A (export in your shell):
  - Create a `.env` file (see keys below) and export them in your shell before starting the server, or source them manually.
- Option B (preload dotenv at runtime):
  - Start the server with Node preloading dotenv: `node -r dotenv/config server.js`

Environment variables required:

```
OPENAI_API_KEY=your_openai_api_key
CLIMATIQ_API_KEY=your_climatiq_api_key
GOOGLE_API_KEY=your_google_api_key
MONGO_URI=your_mongodb_connection_string
GOOGLE_CS_KEY=your_google_custom_search_api_key
GOOGLE_CS_CX=your_google_custom_search_engine_id
```

3. Start the server: run `npm start` (if variables are exported), or `node -r dotenv/config server.js`.
4. Open the app: visit `http://localhost:3000` in your browser. Static assets are served from `public/` and the index page is rendered from `views/index.ejs`.

## Environment Variables

These variables are required for full functionality:

- `OPENAI_API_KEY`: used for `/api/evaluate-text` via OpenAI Chat Completions.
- `CLIMATIQ_API_KEY`: used for `/api/freight` and `/api/cloud` emission calculations.
- `GOOGLE_API_KEY`: used for `/api/travel-time` via Google Distance Matrix.
- `MONGO_URI`: MongoDB connection string for device data (database `phone-carbon-data`).

Set them locally in `.env` (and export or preload), or as secrets in your deployment environment.

## Running Tests

Run the test suite with:

```
npm test
```

## API Endpoints

- `POST /api/freight`: Calculate freight emissions via Climatiq.
- `POST /api/evaluate-text`: Extract sources and evaluate text using OpenAI.
- `POST /api/product-emissions`: Lookup or add device emissions to MongoDB.
- `POST /api/product-recommendations`: Recommend devices (uses MongoDB).
- `POST /api/travel-time`: Driving distance via Google Distance Matrix.
- `POST /api/cloud`: Cloud instance emissions via Climatiq.
- `POST /post-google-maps-air`: Save air map data to `public/data/air-map-data.json`.
- `POST /post-google-maps-ground`: Save ground map data to `public/data/ground-map-data.json`.
- `GET /get-map-air-data`: Retrieve air map data JSON.
- `GET /get-map-ground-data`: Retrieve ground map data JSON.

## Deployment (Fly.io)

Set required secrets and deploy:

```
fly secrets set OPENAI_API_KEY=... CLIMATIQ_API_KEY=... GOOGLE_API_KEY=... MONGO_URI=...
fly deploy
```

Open and check status:

```
fly apps open
fly status
```

This server is built with Express and EJS, serving static assets from `public/`.
