# Python Backend - Electricity Footprint Calculator

This Flask-based Python backend handles electricity footprint calculations for the Living Sustainability system. It provides specialized APIs for analyzing electronic device energy consumption and calculating location-specific carbon footprints from electricity usage.

## Features

- **Device Energy Analysis**: Extracts electronic device information and energy consumption from natural language using OpenAI GPT-4o-mini
- **Location-based Carbon Intensity**: Retrieves real-time carbon intensity data for specific geographic locations
- **Electricity Footprint Calculation**: Calculates carbon footprints, gasoline equivalents, and US baseline comparisons
- **Geocoding Services**: Converts location names to coordinates using Nominatim geocoding
- **Real-time Data Integration**: Fetches live carbon intensity data from Electricity Maps API

## Installation

### Using pip
```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment on MacOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Environment Variables

Set the following environment variables for full functionality:

```bash
# Required for OpenAI device analysis
OPENAI_API_KEY=your_openai_api_key

# Required for Electricity Maps carbon intensity data
ELECTRICITYMAPS_API_KEY=your_electricitymaps_api_key
```

Create a `.env` file in the project root:
```
OPENAI_API_KEY=your_openai_api_key
ELECTRICITYMAPS_API_KEY=your_electricitymaps_api_key
```

## Running the Server

### Local Development
```bash
# Using pip
python app.py
```

The server will start on `http://localhost:8000`

### Production Mode
```bash
# Using Poetry
poetry run gunicorn -w 4 -b 0.0.0.0:8000 app:app

# Using pip
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## API Endpoints

### `POST /get-kwh`
Analyzes text to extract electronic device information and energy consumption.

**Input:**
```json
{
  "sentence": "I am heating a cup of milk with my microwave in Seattle"
}
```

**Output:**
```json
{
  "device_name": "microwave",
  "duration": 0,
  "energy_consumption": 1.2,
  "location": "Seattle"
}
```

### `POST /calculate-electricity-footprint`
Calculates carbon footprint for electricity usage at a specific location.

**Input:**
```json
{
  "location_name": "Seattle",
  "electricity_used": 2.5
}
```

**Output:**
```json
{
  "carbon_intensity": 120.5,
  "carbon_footprint": 0.30125,
  "gallons_of_gasoline": 0.0339,
  "us_baseline_footprint": 1.135
}
```

### `POST /get-coordinates`
Converts location names to geographic coordinates.

**Input:**
```json
{
  "location_name": "Seattle"
}
```

**Output:**
```json
{
  "latitude": 47.6038321,
  "longitude": -122.330062
}
```

### `GET /`
Health check endpoint that returns "hello from fly.io"

## Dependencies

- **Flask**: Web framework for API endpoints
- **Flask-CORS**: Cross-origin resource sharing support
- **OpenAI**: GPT-4o-mini integration for device analysis
- **Geopy**: Geocoding services for location processing
- **Requests**: HTTP client for API calls
- **Pydantic**: Data validation (for future enhancements)

## Deployment

### Fly.io Deployment
```bash
# Set environment variables
fly secrets set OPENAI_API_KEY=your_key ELECTRICITYMAPS_API_KEY=your_key

# Deploy
fly deploy

# Check status
fly status
```

### Docker Deployment
```bash
# Build image
docker build -t lca-py-server .

# Run container
docker run -p 8080:8080 -e OPENAI_API_KEY=your_key -e ELECTRICITYMAPS_API_KEY=your_key lca-py-server
```