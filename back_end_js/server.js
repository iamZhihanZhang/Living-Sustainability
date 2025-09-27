// ! commonJS
'use strict';

require('dotenv').config();

// const OpenAI = require('openai');
const express = require('express');
const axios = require('axios');
// const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// const cheerio = require('cheerio');
const app = express();
// const { MongoClient, ObjectId } = require('mongodb');

const { extractSourcesFromText } = require('./utils/analysis');
const { getCompletion } = require('./utils/openai-api');
const { findOrAddDeviceToDatabase, recommendModels } = require('./utils/phone');
const { readDataFromFile } = require('./utils/database');

// Middleware to parse JSON
app.use(express.json());
// set up static content
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Allow all origins.
app.use(cors());

// Paths to the JSON files
const airDataFilePath = path.join(__dirname, 'public', 'data', 'air-map-data.json');
const groundDataFilePath = path.join(__dirname, 'public', 'data', 'ground-map-data.json');

const { client } = require('./utils/database');

// Load initial data
let mapAirData = readDataFromFile(airDataFilePath);
let mapGroundData = readDataFromFile(groundDataFilePath);

process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});

// Serve the index.ejs file
app.get('/', (req, res) => {
  res.render('index');
});

console.log('trivial comment');

/**
 * Takes in shipping information and uses climatiq API to calculate the corresponding carbon emissions
 */
app.post('/api/freight', async (req, res) => {
  const url = 'https://api.climatiq.io/freight/v2/intermodal';
  const apiKey = process.env.CLIMATIQ_API_KEY;
  const data = req.body;

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error making request:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Takes in an input text and returns a JSON extracting the raw materials, transport, or use/energy from the text.
 */
app.post('/api/evaluate-text', async (req, res) => {
  const inputText = req.body.text;
  if (!inputText || typeof inputText !== 'string') {
    return res.status(400).json({ error: 'Invalid input text' });
  }

  try {
    const updatedPrompt = await extractSourcesFromText(inputText);
    const context = "You are a professional environmental scientist and life-cycle assessment (LCA) engineer.";
    let responseMessage = await getCompletion(updatedPrompt, context);

    // Remove markdown-style formatting from the message
    responseMessage = responseMessage.replace(/```json|```/g, '');
    console.log('responseMessage = ', responseMessage);

    try {
      // Fix potential trailing commas before parsing JSON
      let cleanedResponse = responseMessage.replace(/,(\s*[\]}])/g, '$1');
      // Additional cleanup for other common JSON syntax issues
      cleanedResponse = cleanedResponse.trim();
      
      const parsedJson = JSON.parse(cleanedResponse);
      if (!parsedJson) {
        return res.json({ data: "null" });
      }
      return res.json(parsedJson);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Response was:', responseMessage);
      return res.status(500).json({ error: 'Failed to parse response data', details: parseError.message });
    }
    res.json(parsedJson);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Takes in product_name and returns a JSON of the product's carbon emissions. This is used with phone models
 */
app.post('/api/product-emissions', async (req, res) => {
  try {
    const productName = req.body.product_name;
    console.log('PRODUCT NAME = ' + productName);
    const parsedJson = await findOrAddDeviceToDatabase(productName);
    res.send(parsedJson);
  } catch (error) {
    console.log(error);
    return [];
  }
});

/**
 * Takes in product_name and returns a JSON containing the carbon information of the recommended devices based on the product_name
 */
app.post('/api/product-recommendations', async (req, res) => {
  try {
    const productName = req.body.product_name;
    console.log('PRODUCT NAME = ' + productName);
    const recommendedModels = await recommendModels(productName);
    recommendedModels.forEach((phone, index) => {
      phone.index = index;
    });
    res.json(recommendedModels);
  } catch (error) {
    console.log(error);
  }
});

/**
 * Takes in two locations (from, to) and returns the driving distance between them
 */
app.post('/api/travel-time', async(req, res) => {
  const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const apiKey = process.env.GOOGLE_API_KEY;
  const from = req.body.from;
  const to = req.body.to;
  try {
    const response = await axios.get(url, {
      params: {
        origins: from,
        destinations: to,
        travelMode: 'DRIVING',
        units: 'imperial',
        key: apiKey
      }
    });
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Takes in cloud information and uses climatiq API to return its corresponding carbon emissions
 */
app.post('/api/cloud', async(req, res) => {
  const url = 'https://api.climatiq.io/compute/v1/azure/instance';
  const apiKey = process.env.CLIMATIQ_API_KEY;
  const data = req.body;
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//& ********* This part is for Google Maps *************
/**
 * Takes in data used for creating air map and writes that data into air-map-data.json
 */
app.post('/post-google-maps-air', (req, res) => {
  mapAirData = req.body;
  try {
    // Write the data to the JSON file
    fs.writeFileSync(airDataFilePath, JSON.stringify(mapAirData, null, 2), 'utf8');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error writing to air-map-data.json:', error.message);
    // Send an error response
    res.status(500).json({ error: 'Failed to update air-map-data.json' });
  }
});

/**
 * Takes in data used for creating ground map and writes that data into ground-map-data.json
 */
app.post('/post-google-maps-ground', (req, res) => {
  mapGroundData = req.body;
  try {
    // Write the data to the JSON file
    fs.writeFileSync(groundDataFilePath, JSON.stringify(mapGroundData, null, 2), 'utf8');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error writing to air-map-data.json:', error.message);
    // Send an error response
    res.status(500).json({ error: 'Failed to update air-map-data.json' });
  }
});

/**
 * Retrieves the JSON data from air-map-data.json
 */
app.get('/get-map-air-data', (req, res) => {
  try {
    const data = fs.readFileSync(airDataFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error('Error reading air-map-data.json:', error.message);
    res.status(500).json({ error: 'Failed to retrieve air map data' });
  }
});

/**
 * Retrieves the JSON data from ground-map-data.json
 */
app.get('/get-map-ground-data', (req, res) => {
  try {
    const data = fs.readFileSync(groundDataFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error('Error reading ground-map-data.json:', error.message);
    res.status(500).json({ error: 'Failed to retrieve ground map data' });
  }
});
//& ^^^^^^^This part is for Google Maps ^^^^^^^^^^^^^^^^


// Start web server on port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})

module.exports = app;