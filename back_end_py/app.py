from flask import Flask, request, jsonify
from flask_cors import CORS
from geopy.geocoders import Nominatim
import requests
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for all routes

ELECTRICITYMAPS_API_KEY = os.environ.get("ELECTRICITYMAPS_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

@app.route('/')
def hello_fly():
    return 'hello from fly.io'

@app.route('/get-kwh', methods=['POST'])
def get_kwh_from_device():
    """
    Analyzes a text and returns a dictionary containing the electronic device that is in the text, along with its
    respective energy consumption and duration used. Returns 'null' if device information is not found.

    Args:
        sentence: The sentence to analyze

    Example input:
    {
        "sentence": "I am heating a cup of milk with my microwave in Seattle"
    }

    Example output:
    {
        "device_name": "microwave",
        "duration": 0,
        "energy_consumption": 1.2,
        "location": "Seattle"
    }
    """
    sentence = request.json.get("sentence");
    if not sentence:
        return jsonify({"error": "sentence is not valid"}), 400
    print('OPENAI_API_KEY = ', OPENAI_API_KEY)
    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = """
      Analyze the sentence below to identify a relevant electronic device. Then, return a dictionary following this format:

        {
          "device_name": <the name of the device>,
          "location": <where the device is being used>
          "energy_consumption": <the energy consumption in kWh>,
          "duration": <the usage duration in minutes>
        }

      "device_name" is the name of the device. Return null if not given.
      "location" is where the device is being used. Return null if not given.
      "energy_consumption" is the device's estimated energy consumption per hour in kWh. You will need to infer this based on your current knowledge.
      "duration" is how long the device is being used for. If a duration is not given from the sentence, return 0.

      If multiple devices are present, choose the most energy-intensive device and return a dictionary containing that device's information.
      If no devices are found, return null.
    """
    first_user_message = f"Sentence: {sentence}"
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": first_user_message}
    ]
    try:
        first_response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
        result = json.loads(first_response.choices[0].message.content)
        return jsonify(result);
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/calculate-electricity-footprint', methods=['POST'])
def calculate_footprint():
    """
    Calculate the carbon footprint of electricity usage and related metrics.

    Args:
        location_name (str): Name of the location.
        electricity_used (float): Amount of electricity used in kWh.

    Returns:
        tuple: Carbon intensity, carbon footprint, gallons of gasoline equivalent, US baseline footprint.
    """
    data = request.json

    if not data or 'location_name' not in data or 'electricity_used' not in data:
        return jsonify({"error": "Invalid input"}), 400

    location_name = data['location_name']
    # The amount of electricity used in kWh
    electricity_used = data['electricity_used']

    try:
        result = calculate_electricity_footprint(location_name, electricity_used)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-coordinates', methods=['POST'])
def gc():
    """
    Retrieve the latitude and longitude of a given location.

    Args:
        location_name (str): The name of the location to geocode.

    Returns:
        JSON: Latitude and longitude of the location or None if not found.

    Example:
        Input: { "location_name": "Seattle" }
        Output: { "latitude": 47.6038321, "longitude": -122.330062 }
    """
    data = request.json
    if not data or 'location_name' not in data:
        return jsonify({"error": "Invalid input"}), 400
    location_name = data['location_name']
    try:
        coordinates = get_coordinates(location_name=location_name)
        if coordinates:
            lat, lon = coordinates
            return jsonify({
                "latitude": lat,
                "longitude": lon
            })
        else:
            return jsonify(None)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_coordinates(location_name):
    """
    Retrieve the latitude and longitude of a given location.

    Args:
        location_name (str): The name of the location to geocode.

    Returns:
        tuple: Latitude and longitude of the location or None if not found.
    """
    geolocator = Nominatim(user_agent="GetLoc")
    location = geolocator.geocode(location_name)

    if location:
        return location.latitude, location.longitude
    else:
        return None


def get_electricity_carbon_intensity(lat, lon):
    """
    Fetch the carbon intensity of electricity for given latitude and longitude.

    Args:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.

    Returns:
        float: Carbon intensity in gCO2/kWh or None if the request fails.
    """
    # url = f'https://api.electricitymap.org/v3/carbon-intensity/history?lat={lat}&lon={lon}'
    # headers = {
    #     'auth-token': ELECTRICITYMAPS_API_KEY
    # }
    # response = requests.get(url, headers=headers)

    # if response.status_code == 200:
    #     data = response.json()
    #     return data['history'][0]['carbonIntensity']
    # else:
    url = f'https://api.electricitymap.org/v3/carbon-intensity/latest?lat={lat}&lon={lon}'
    headers = {
        'auth-token': ELECTRICITYMAPS_API_KEY
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data['carbonIntensity']
    else:
        raise Exception(f"Carbon intensity request failed: {response.status_code}")#     raise Exception(f"Carbon intensity request failed: {response.status_code}")



def calculate_electricity_footprint(location_name, electricity_used):
    """
    Calculate the carbon footprint of electricity usage and related metrics.

    Args:
        location_name (str): Name of the location.
        electricity_used (float): Amount of electricity used in kWh.

    Returns:
        tuple: Carbon intensity, carbon footprint (kg CO2e), gallons of gasoline equivalent, US baseline footprint.
    """
    coordinates = get_coordinates(location_name)
    if not coordinates:
        raise Exception(f"Location '{location_name}' not found.")

    lat, lon = coordinates
    carbon_intensity = get_electricity_carbon_intensity(lat, lon)
    if not carbon_intensity:
        raise Exception("Error retrieving carbon intensity.")

    carbon_footprint = (carbon_intensity * electricity_used) / 1000  # Convert g CO2e to kg CO2e
    gallons_of_gasoline = carbon_footprint / 8.887  # Convert kg CO2e to gallons of gasoline
    us_baseline_intensity = 454  # US baseline g CO2e/kWh
    us_baseline_footprint = (us_baseline_intensity * electricity_used) / 1000  # Convert g CO2e to kg CO2e

    return {
        "carbon_intensity": carbon_intensity,
        "carbon_footprint": carbon_footprint,
        "gallons_of_gasoline": gallons_of_gasoline,
        "us_baseline_footprint": us_baseline_footprint,
    }


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)