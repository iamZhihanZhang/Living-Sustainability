
'use strict';

const { connectToDB, insertDevices } = require('./database');
const { getCompletion } = require('./openai-api');
const { productPCFGoogleSearch } = require('./search');
const { analyzeEnvironmentalReports } = require('./analysis');

const { ObjectId } = require('mongodb');
/**
 * !Don't delete this function
 * Adds the normalized_name property to every entries of the phone database
 */
async function addNormalizedName() {
  try {
      const db = await connectToDB();
      const collection = db.collection("devices");
      // Add 'normalized_name' field to all documents
      const cursor = collection.find();
      while (await cursor.hasNext()) {
          const document = await cursor.next();
          const normalizedName = normalizeDeviceName(document.device);
          // Update the document with the normalized_name field
          await collection.updateOne(
              { _id: document._id }, // Filter by document's unique ID
              { $set: { normalized_name: normalizedName } } // Add normalized_name field
          );
          console.log(`Updated document ${document._id} with normalized_name: ${normalizedName}`);
      }
  } catch (error) {
      console.error("Error updating documents:", error);
  } finally {
      await client.close();
  }
}


/**
 * Takes in a phone name, checks if that phone exists in the phone database, then returns the phone carbon data
 * @param {String} targetPhoneName The phone to check
 * @returns Returns the carbon data of that phone if it exists, returns null otherwise.
 */
async function checkPhoneExists(targetPhoneName) {
  try {
    const db = await connectToDB();
    const collection = db.collection("devices");

    const normalizedTarget = normalizeDeviceName(targetPhoneName);
    console.log('normalized target: ' + normalizedTarget);
    const existingPhone = await collection.findOne({ normalized_name: normalizedTarget });

    return existingPhone;
  } catch (error) {
    console.log(error);
    return null;
  }
}


/**
 * Takes in a phone carbon data object, and returns an array containing the carbon data of the competitors of that phone.
 * @param {Object} existingPhoneObject The existing phone object
 * @returns {Array} An object array containing the carbon data of the competitors of that phone.
 */
async function getCompetitors(existingPhoneObject) {
  if (!existingPhoneObject || !existingPhoneObject.competitors || existingPhoneObject.competitors.length < 1) {
    return [];
  }
  try {
    const db = await connectToDB();
    const collection = db.collection("devices");

    const competitorEntries = await collection
            .find({ _id: { $in: existingPhoneObject.competitors.map(id => new ObjectId(id)) } })
            .toArray();

    return competitorEntries;
  } catch (error) {
    console.log(error);
  }
}


/**
 * Takes an existing phone object and an array of competitor names, and adds the 'competitors' field to the existing phone object containg the id of each competitor
 * @param {Object} existingPhoneObject The existing phone object
 * @param {Array} competitorNames An array of competitor names, for example: arr = ["Samsung Z Flip6", "Google Pixel 8 Pro"]
 */
async function addCompetitors(existingPhoneObject, competitorNames) {
  if (!existingPhoneObject || !existingPhoneObject._id) {
    console.log("Invalid existingPhone object.");
    return;
  }
  try {
    const db = await connectToDB();
    const collection = db.collection('devices');
    const normalizedCompetitorNames = competitorNames.map(normalizeDeviceName);

    const matchingCompetitors = await collection
        .find({ normalized_name: { $in: normalizedCompetitorNames } })
        .toArray();

    if (matchingCompetitors.length === 0) {
      console.log("No matching competitors found in the database.");
      return;
    }
    const competitorIds = matchingCompetitors.map(competitor => competitor._id);

    const result = await collection.updateOne(
      { _id: existingPhoneObject._id },
      { $addToSet: { competitors: { $each: competitorIds } } }
    );
    console.log(`Updated ${result.modifiedCount} document(s).`);
  } catch (error) {
    console.log(error);
  }
}


/**
 * Takes in the product name and returns an array containing JSON carbon information of the models that are recommended based on OpenAI API results.
 * @param {String} phoneName The phone name
 * @returns An array containing JSON carbon information of the models that are recommended based on OpenAI API results.
 */
async function recommendModels(phoneName) {
  console.log('finding recommendations for: ' + phoneName);
  const phoneObject = await checkPhoneExists(phoneName);
  if (phoneObject) {
    let competitorsList = await getCompetitors(phoneObject);
    // !There should be at least 2 phone recommendations. This is a safeguard in case the GPT prompt gave us 1 recommended phone
    if (competitorsList.length > 1) {
      return competitorsList;
    } else {
      console.log(`Less than 2 competitors found on ${phoneName}. Running recommendation prompt..`);
      const recommendationPrompt = `
        Given a phone model name, ${phoneName}, recommend two similar smartphone models from other well-known brands, like Google.
        Your recommendations should have similar prices and specifications, focusing on models with comparable features, performance, and popularity.
        Use your most up-to-date knowledge and provide the brand, model name, and a brief comparison of key specifications (such as processor, camera, and display) to highlight similarities.
        Ensure the recommendations are recent models that would appeal to users considering the specified phone. Provide your response in the following JSON format:

        Required JSON format:
        {
          "recommendations": [
            { "device": "<brand and model name>", "comparison": "<brief comparison>" },
            { "device": "<brand and model name>", "comparison": "<brief comparison>" }
          ]
        }
      `;
      const context = "You are an expert in consumer electronics, specializing in recommending comparable products across major categories such as smartphones, laptops, cameras, smartwatches, and tablets."

      let responseMessage;
      try {
        responseMessage = await getCompletion(recommendationPrompt, context);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        return;
      }

      responseMessage = responseMessage.replace(/```json|```/g, '');
      let response = JSON.parse(responseMessage);
      console.log('recommendedList = ');
      console.log(response);

      const competitorsList = [];
      for (const entry of response.recommendations) {
        const model = entry.device;
        const competitorName = await findOrAddDeviceToDatabase(model);
        competitorsList.push(competitorName);
      }
      const competitorNameList = response.recommendations.map((entry) => entry.device);
      await addCompetitors(phoneObject, competitorNameList);

      competitorsList.forEach((r, index) => {
        r.id = index;
      });
      return competitorsList;
    }
  } else {
    console.error(`Cannot find ${phoneName} in the phone database`);
  }
}


/**
 * Return the device carbon info if it already exists in database. Otherwise, perform a carbon estimation on the device and return the carbon info of the device.
 * @param {String} newPhoneName The new device name. e.g. "iPhone 15"
 * @returns The JSON carbon data for the new device
 */
async function findOrAddDeviceToDatabase(newPhoneName) {
  let existingDevice = await checkPhoneExists(newPhoneName);
  if (existingDevice) {
    console.log('EXISTING DEVICE FOUND');
    return existingDevice;
  } else {
    console.log('ADDING NEW DEVICE');
    // Perform the Google search and document loading
    const docs = await productPCFGoogleSearch(newPhoneName, 2);
    // Analyze the keyword based on the loaded documents
    const analysisResult = await analyzeEnvironmentalReports(newPhoneName, docs);
    const formattedResult = analysisResult.replace(/```json|```/g, '');
    let newDevice = JSON.parse(formattedResult);
    newDevice.normalized_name = normalizeDeviceName(newDevice.device);
    newDevice.base_co2e = parseFloat(newDevice.base_co2e);
    newDevice = addCO2eToSpecs(newDevice);

    console.log('newDevice = ');
    console.log(newDevice);
    await insertDevices(newDevice);
    return newDevice;
  }
}

/**
 * Returns whether the two devices match with each other
 * @param {String} existingDeviceName The existing device name in the phone database
 * @param {String} newDeviceName The new device name.
 * @returns
 */
function matchDevice(existingDeviceName, newDeviceName) {
  const normalizedExisting = normalizeDeviceName(existingDeviceName);
  const normalizedNew = normalizeDeviceName(newDeviceName);
  return normalizedExisting == normalizedNew;
}

// Normalize a string: lowercase, trim spaces, and collapse multiple spaces
function normalizeDeviceName(name) {
  return name
    .toLowerCase()
    // Remove common unnecessary suffixes (word boundaries ensure we match standalone terms)
    // .replace(/\b(ultra|pro|max|plus|mini|lite|se|edge|global|international|unlocked|dual sim)\b/g, '')
    .replace(/\b(global|international|unlocked|dual sim)\b/g, '')
    // Remove connectivity indicators
    .replace(/\b(5g|4g|lte)\b/g, '')
    // Remove storage and RAM specs
    .replace(/\b(\d{1,4}gb(\s*ram)?)\b/g, '')
    // Remove finish types
    .replace(/\b(matte|glossy|ceramic|glass)\b/g, '')
    // Remove colors
    .replace(/\b(black|white|blue|green|silver|gold|red|purple|pink|yellow)\b/g, '')
    // Remove generation/year
    .replace(/\b(gen\s*\d+|20\d{2})\b/g, '')
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim(); // Remove leading/trailing spaces
}


/**
 * Takes in JSON data of a phone model, and adds the 'co2e' property to the specs section.
 * @param {JSON} data
 * @returns the updated JSON data with co2e value
 */
function addCO2eToSpecs(data) {
  const baseCO2e = parseFloat(data.base_co2e);
  data.specs.forEach((spec, index) => {
    const currentStorage = toGB(spec.storage);
    if (index === 0) {
      // First entry: co2e = base_co2e
      spec.co2e = baseCO2e;
    } else {
      // For subsequent entries, calculate co2e based on previous entry's storage
      const previousStorage = parseInt(data.specs[index - 1].storage);
      const previousCo2e = parseInt(data.specs[index - 1].co2e);
      const co2eIncrease = ((currentStorage - previousStorage) * (6 / 128));
      console.log('base CO2e = ' + baseCO2e);
      console.log('co2eIncrease = ' + co2eIncrease);
      spec.co2e = previousCo2e + co2eIncrease;
    }
    spec.co2e = Math.round(spec.co2e);
  });
  return data;
}

/**
   * Takes in the storage value and returns a numerical value in gigabytes (e.g. "256 GB" --> 256)
   * @param {String} storage the storage of a phone model (e.g. "256 GB", "1 TB")
   */
function toGB(storage) {
  const storageValue = parseFloat(storage);
  if (storage.includes("TB")) {
    return storageValue * 1024;
  } else if (storage.includes("GB")) {
    return storageValue;
  } else if (storage.includes("MB")) {
    return storageValue / 1024;
  }
  return storageValue;
}

module.exports = { addNormalizedName, checkPhoneExists, getCompetitors, addCompetitors, recommendModels, findOrAddDeviceToDatabase, normalizeDeviceName, addCO2eToSpecs}