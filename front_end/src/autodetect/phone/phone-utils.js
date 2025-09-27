// Utilities function for phone feature

import { toGB } from "../../utils/math-utils";

const LCA_SERVER_URL = process.env.LCA_SERVER_URL || "https://lca-server-api.fly.dev";

export function detectPhoneModel(title) {
  const phonePatterns = [
    // iPhone models
    { regex: /iPhone\s?13/i, model: "iPhone 13" },
    { regex: /iPhone\s?14\s?Pro/i, model: "iPhone 14 Pro" },
    { regex: /iPhone\s?14\s?Max/i, model: "iPhone 14 Max" },
    { regex: /iPhone\s?14/i, model: "iPhone 14" },
    { regex: /iPhone\s?15\s?Pro/i, model: "iPhone 15 Pro" },
    { regex: /iPhone\s?15\s?Max/i, model: "iPhone 15 Max" },
    { regex: /iPhone\s?15/i, model: "iPhone 15" },
    { regex: /iPhone\s?16\s?Pro/i, model: "iPhone 16 Pro" },
    { regex: /iPhone\s?16\s?Max/i, model: "iPhone 16 Max" },
    { regex: /iPhone\s?16/i, model: "iPhone 16" },

    // Samsung Galaxy models
    { regex: /Galaxy\s?Z[\s-]?Flip6/i, model: "Samsung Galaxy Z Flip6" },
    { regex: /Galaxy\s?Z[\s-]?Flip5/i, model: "Samsung Galaxy Z Flip5" },
    { regex: /Galaxy\s?S24\s?Ultra/i, model: "Samsung Galaxy S24 Ultra" },
    { regex: /Galaxy\s?S23\s?Ultra/i, model: "Samsung Galaxy S23 Ultra" },
    { regex: /Galaxy\s?A14\s?5G/i, model: "Samsung Galaxy A14 5G" },
    { regex: /Galaxy\s?A14\s?4G/i, model: "Samsung Galaxy A14 4G" },
    { regex: /Galaxy\s?A34\s?5G/i, model: "Samsung Galaxy A34 5G" },
    { regex: /Galaxy\s?A04e/i, model: "Samsung Galaxy A04e" },

    // Oppo models
    { regex: /Oppo\s?Find\s?X5\s?Pro|Oppo\s?FindX5\s?Pro/i, model: "Oppo Find X5 Pro" },
    { regex: /Oppo\s?Reno\s?8\s?Pro|Oppo\s?Reno8\s?Pro/i, model: "Oppo Reno 8 Pro" },
    { regex: /Oppo\s?A16/i, model: "Oppo A16" },
    { regex: /Oppo\s?A54/i, model: "Oppo A54" },

    // Huawei models
    { regex: /Huawei\s?Mate\s?50\s?Pro|Huawei\s?Mate50\s?Pro/i, model: "Huawei Mate 50 Pro" },
    { regex: /Huawei\s?P50\s?Pro|Huawei\s?P50Pro/i, model: "Huawei P50 Pro" },
    { regex: /Huawei\s?Nova\s?10\s?Pro|Huawei\s?Nova10\s?Pro/i, model: "Huawei Nova 10 Pro" },

    // Lenovo models
    { regex: /Lenovo\s?Legion\s?Phone\s?Duel\s?2|Lenovo\s?LegionDuel\s?2/i, model: "Lenovo Legion Phone Duel 2" },
    { regex: /Lenovo\s?K14\s?Plus|Lenovo\s?K14Plus/i, model: "Lenovo K14 Plus" },

    // Google Pixel models
    { regex: /Pixel\s?9\s?Pro\s?Fold/i, model: "Google Pixel 9 Pro Fold" },
    { regex: /Pixel\s?9\s?Pro/i, model: "Google Pixel 9 Pro" },
    { regex: /Pixel\s?9/i, model: "Google Pixel 9" },
    { regex: /Pixel\s?8\s?Pro/i, model: "Google Pixel 8 Pro" },
    { regex: /Pixel\s?8/i, model: "Google Pixel 8" },
    { regex: /Pixel\s?Fold/i, model: "Google Pixel Fold" },
    { regex: /Pixel\s?7\s?Pro/i, model: "Google Pixel 7 Pro" },
    { regex: /Pixel\s?7a/i, model: "Google Pixel 7a" },
    { regex: /Pixel\s?7/i, model: "Google Pixel 7" },
    { regex: /Pixel\s?6/i, model: "Google Pixel 6" },
    { regex: /Pixel\s?6a/i, model: "Google Pixel 6a" },
    { regex: /Pixel\s?6\s?Pro/i, model: "Google Pixel 6 Pro" },
    { regex: /Pixel\s?5a/i, model: "Google Pixel 5a" },
    // Add more phones as needed
  ];

  // Loop through the map and test the title for each phone model
  for (const { regex, model } of phonePatterns) {
    if (regex.test(title)) {
      console.log(`${model} detected!!!!!!!!!!!!!!!`);
      return model;
    }
  }
  console.log("Phone model not detected");
  return null;
}

export async function getPhoneCarbonData(phoneModel) {
  const jsonPhoneModel = {
    product_name: phoneModel
  };

  try {
    const response = await fetch(LCA_SERVER_URL + '/api/product-emissions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonPhoneModel)
    });
    let responseData;
    if (response.ok) {
      responseData = await response.json();
    } else {
      responseData = null;
      console.error('Error analyzing phone carbon emissions');
    }
    return responseData;
  } catch (error) {
    console.error('Error analyzing phone carbon emissions: ' + error);
  }
}

/**
   * Returns a JSON Object that contains the carbon data of two recommended phone models based on the input phoneModel
   * @param {String} phoneModel the phone model
   * @returns {JSON} JSON Object of the two recommended phone models
   */
export async function getRecommendedModels(phoneModel) {
  const jsonPhoneModel = {
    product_name: phoneModel
  };
  try {
    const response = await fetch(LCA_SERVER_URL + '/api/product-recommendations', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonPhoneModel)
    });
    let responseData;
    if (response.ok) {
      responseData = await response.json();
    } else {
      responseData = null;
      console.error('Error analyzing phone carbon emissions');
    }
    return responseData;
  } catch (error) {
    console.error(error);
  }
}

/**
   * Function to create aligned storage arrays from arrays of objects
   * Example input:
   *  arr1 = [{ storage: '256GB', co2e: '12kg' }, { storage: '512GB', co2e: '24kg' }, { storage: '1 TB', co2e: '48kg' }];
   *  arr2 = [{ storage: '1 TB', co2e: '48kg' }];
   * @param {Array} arr1 An array object containing storage and co2e of a device
   * @param {Array} arr2 An array object containing storage and co2e of a device
   * @returns  Example Output: [
                 [ { storage: '--', co2e: '--' }, { storage: '256GB', co2e: '12kg' }, { storage: '512GB', co2e: '24kg' }, { storage: '1 TB', co2e: '48kg' }, { storage: '2 TB', co2e: '96kg' } ],
                 [ { storage: '128GB', co2e: '6kg' }, { storage: '256GB', co2e: '12kg' }, { storage: '512GB', co2e: '24kg' }, { storage: '1 TB', co2e: '48kg' }, { storage: '--', co2e: '--' } ]
              ]
*/
export function alignStorageArrays(arr1, arr2) {
  // Extract unique storage values from both arrays
  const uniqueStorageValues = new Set([
    ...arr1.map((item) => item.storage),
    ...arr2.map((item) => item.storage),
  ]);

  // Sort the unique storage values
  const sortedStorageValues = Array.from(uniqueStorageValues).sort(
    (a, b) => toGB(a) - toGB(b)
  );

  // Initialize new aligned arrays with placeholders
  const newArr1 = [];
  const newArr2 = [];

  // Align storage values and fill placeholders
  sortedStorageValues.forEach((value) => {
    const obj1 = arr1.find((item) => item.storage === value);
    const obj2 = arr2.find((item) => item.storage === value);

    newArr1.push(obj1 ? obj1 : { storage: value, co2e: "--" });
    newArr2.push(obj2 ? obj2 : { storage: value, co2e: "--" });
  });

  for (let i = 0; i < newArr1.length; i++) {
    if (newArr1[i].co2e == "--") {
      newArr1[i].storage = "--";
    }

    if (newArr2[i].co2e == "--") {
      newArr2[i].storage = "--";
    }
  }

  markMostEcoFriendlyIndex(arr1);
  markMostEcoFriendlyIndex(arr2);

  return [newArr1, newArr2];
}

// Takes in the storage array and flags the index that has the most eco-friendly option
function markMostEcoFriendlyIndex(arr) {
  const mostEcoIndex = arr.findIndex((item) => item.co2e !== "--");
  if (mostEcoIndex !== -1) {
    arr[mostEcoIndex].mostEco = true;
  }
}