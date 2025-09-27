
'use strict';
// Utility methods for managing the mongoDB database

const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
const fs = require('fs');

/**
 * Establishes a connection with phone-carbon-data database and returns the db instance
 * @returns the database db
 */
async function connectToDB() {
  try {
    await client.connect();
    console.log('connected to MongoDB');
    return client.db("phone-carbon-data");
  } catch (error) {
    console.log(error);
  }
}

/**
 * Takes in the phone carbon data and inserts that into the devices collection
 * @param {Object} data the phone carbon data
 */
async function insertDevices(data) {
  try {
    const db = await connectToDB();
    const collection = db.collection("devices");
    const result = await collection.insertOne(data);
    console.log("Data inserted with ID:", result.insertedId);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves all data from the 'devices' collection of 'lcavizdb' and return it as a JSON
 * @returns a JSON data containing all phone carbon info
 */
async function getDevicesData() {
  try {
    const db = await connectToDB();
    const collection = db.collection("devices");
    const data = await collection.find({}).toArray();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Takes in a normalized device name and deletes that entry from the database
 * @param {String} normalizedDeviceName The normalized device name
 */
async function deleteData(normalizedDeviceName) {
  try {
    const db = await connectToDB();
    const collection = db.collection("devices");
    const result = await collection.deleteOne({ normalized_name: normalizedDeviceName });
    console.log("Number of documents deleted:", result.deletedCount);
  } catch (error) {
    console.log(error);
  }
}

// Function to read data from a JSON file
function readDataFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return {};
  }
}

module.exports = { connectToDB, insertDevices, getDevicesData, deleteData, readDataFromFile }