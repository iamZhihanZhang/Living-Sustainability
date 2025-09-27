
// Utilities function relating to calculation

export function LbtoKg(lbs) {
  return lbs * 0.453;
}

/**
 * Takes in a weight value in kg and determines if the weight needs
// unit conversion (to grams or tons) to make it more readable.
* @param {number} kg
*/
export function getReadableUnit(kg) {
  if (kg < 1.0) {
    const grams = parseFloat((kg * 100).toFixed(2));
    return { weight: grams, unit: "g" };
  } else if (kg >= 1000) {
    const tons = parseFloat((kg / 1000).toFixed(2));
    return { weight: tons, unit: "tons" };
  } else {
    const kilograms = parseFloat(kg.toFixed(2));
    return { weight: kilograms, unit: "kg" };
  }
}


/**
 * Takes in the storage value and returns a numerical value in gigabytes (e.g. "256 GB" --> 256)
 * @param {String} storage the storage of a phone model (e.g. "256 GB", "1 TB")
 */
export function toGB(storage) {
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

/**
 * @param {String} emissionsOne
 * @param {String} emissionsTwo
 * @returns returns null if co2e value is NaN, returns "one" if emissionsOne is less than emissionsTwo, returns "two" otherwise.
 */
export function findGreener(emissionsOne, emissionsTwo) {
  const eOne = parseInt(emissionsOne);
  const eTwo = parseInt(emissionsTwo);
  if (isNaN(eOne) || isNaN(eTwo)) {
    // This is a .greener class used to identify which phone is more eco-friendly
    return null;
  } else if (eOne < eTwo) {
    return "one";
  } else if (eOne > eTwo) {
    return "two";
  }
}

/**
 * Formats a number to a specified number of significant figures, rounding
 * appropriately. It handles both very small and regular-sized numbers.
 *
 * @param {number} num - The number to format.
 * @param {number} [significantFigures=2] - The desired number of significant figures.
 * @returns {string} The formatted number as a string.
 */
export function formatToSignificantFigures(num, significantFigures = 2) {
  if (num === 0) {
    return "0"; // Handle zero separately
  }
  const magnitude = Math.floor(Math.log10(Math.abs(num)));
  const roundingFactor = Math.pow(10, magnitude - significantFigures + 1);
  const roundedNum = Math.round(num / roundingFactor) * roundingFactor;
  const decimalPlaces = Math.max(0, significantFigures - magnitude - 1);
  return roundedNum.toFixed(decimalPlaces);
}

/**
 * Takes in an emissions value and return the appropriate amount of beef consumed.
 * @param {Number} emissions The carbon emissions
 * @returns The equivalent amount of beef consumed in the appropriate unit.
 */
export function getBeefInfo(emissions) {
  let beefValue;
  // let weightObject;
  let beefUnit = "kg";

  let kgBeef;
  kgBeef = emissions * 0.033;
  beefValue = kgBeef;
  if (kgBeef < 0.001) {
    // Convert to milligrams if less than 0.001 kg (1 gram)
    beefValue = kgBeef * 1000000; // 1 kg = 1,000,000 mg
    beefUnit = "mg";
  } else {
    // Convert to grams
    beefValue = kgBeef * 1000; // 1 kg = 1000 g
    beefUnit = "g";
  }
  // console.log('beefValue before formatting: ' + beefValue);
  beefValue = formatToSignificantFigures(beefValue);
  // console.log('beefValue = ' + beefValue + ', beefUnit = ' + beefUnit);
  return { beefValue, beefUnit };
}

/**
 * Converts a CO2e value in kilograms to a more readable format using grams,
 * kilograms, or tons, as appropriate.
 * @param {number} kgCO2e - The CO2e value in kilograms.
 * @returns {{co2e_value: number, unit: string}} An object containing the
 * converted CO2e value and its corresponding unit (g CO2e, kg CO2e, or t CO2e).
 * e.g. getReadableCO2e(0.0011972) returns { co2e_value: 1.2, unit: 'g CO2e' }
 */
export function getReadableCO2e(kgCO2e) {
  if (kgCO2e < 1.0) {
    const grams = parseFloat((kgCO2e * 1000).toFixed(2));
    return { co2e_value: grams, unit: "g CO2e" };
  } else if (kgCO2e >= 1000) {
    const tons = parseFloat((kgCO2e / 1000).toFixed(2));
    return { co2e_value: tons, unit: "t CO2e" };
  } else {
    const kilograms = parseFloat(kgCO2e.toFixed(2));
    return { co2e_value: kilograms, unit: "kg CO2e" };
  }
}