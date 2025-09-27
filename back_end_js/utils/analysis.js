
// Utility functions for carbon analysis and document processing, such as emissions estimation and information extraction

'use strict';

const fs = require('fs');
const axios = require('axios');
const pdf = require('pdf-parse');
const cheerio = require('cheerio');
const path = require('path');

const archiveFilePath = path.join(__dirname, '..', 'public', 'prompt', 'archive.txt');
const gptPromptDataFilePath = path.join(__dirname, '..', 'public', 'prompt', 'current_prompt.txt');

const { getCompletion } = require('./openai-api');

/**
 *
 * @param {String} productName e.g. "iPhone 15"
 * @param {*} documents The text file of the document containing the product's PCF information
 * @returns a JSON format containing the product and its corresponding carbon emissions
 */
async function analyzeEnvironmentalReports(productName, documents) {
  // Combine all the document contents into a single prompt
  const combinedDocuments = documents.map(doc => `Content from ${doc.url}:\n${doc.content}`).join('\n\n');
  const urlString = documents.map(doc => doc.url).toString();
  const cleanDocument = getRelevantCarbonInfo(combinedDocuments);
  fs.writeFileSync(archiveFilePath, cleanDocument, 'utf8');
  const context = "You are a professional environmental scientist and an SEO assistant.";
  console.log('m')

  const prompt = `
    Analyze the device '${productName}' with a focus on SEO and environmental impact. Based on the parsed webpage content below, provide a structured response in JSON format.

    Required JSON format:
    {
      "device": "<phone_model>",
      "base_co2e": "<carbon_emissions>",
      "source": "<source>",
      "method": "<method>"
      "specs": [
        {
          "storage": "<storage_space>"
        },
        ...
      ]
    }

    - **device**: Use the device name '${productName}'. If two devices are found, choose the first device.
    - **base_co2e**: Identify the product's carbon footprint (PCF) in kg CO2-eq per unit. If multiple PCF's are found, choose the lowest PCF value. If a specific PCF is not available from the content, infer an approximate carbon emission based on current knowledge. You must return an integer or float.
    - **source**: Use the relevant urls in this list: ${urlString}. The parsed webpage content are from these urls. If the carbon emissions were inferred and not from the content, include your own source instead.
    - **method**: Either put in 'inferred' or 'given'. 'inferred' means you inferred the carbon emissions. 'given' means you found the information from the given content.
    - **specs**: List all storage options for the device, in GB.

    **Example:**
    Example output:
    {
      "device": "Google Pixel 8 Pro",
      "base_co2e": 79,
      "source": "https://www.gstatic.com/gumdrop/sustainability/pixel-8-pro-product-enviromental-report.pdf",
      "specs": [
        {
          "storage": "128 GB"
        },
        {
          "storage": "256 GB"
        }
      ]
    }

    Content to analyze: \`\`\`${cleanDocument}\`\`\`
  `;

  // Get completion from OpenAI
  let result;
  try {
    result = await getCompletion(prompt, context);
  } catch (error) {
    console.error(error);
    return;
  }
  return result;
}

/**
 * Takes in the HTML or .pdf content of the PCF and returns a text string containing only the relevant carbon information of the product's PCF.
 * @param {String} content The HTML or .pdf content of the PCF
 * @returns An text string containing only the relevant carbon information of the product's PCF.
 */
function getRelevantCarbonInfo(content) {
  // Step 1: Clean the content using regular expressions
  const cleanedContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\[.*?\]/g, '') // Remove footnotes or bracketed text
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/\t+/g, ' ') // Replace tabs with a single space
      .replace(/\n+/g, ' ') // Replace newlines with a single space
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
      .trim();

  // Step 2: Define keywords for CO2e-related information
  const keywords = [
      'CO2e',
      'kg CO2e',
  ];
  const normalizedKeywords = keywords.map(keyword =>
    keyword.replace(/\s+/g, '').toLowerCase()
  );

  // Step 3: Analyze the content for keywords and extract relevant sections
  const relevantSections = [];
  const words = cleanedContent.split(/\s+/); // Split content into words
  let skipUntil = -1;

  words.forEach((_, index) => {

    // Skip words if within the skip range
    if (index <= skipUntil) {
      return;
    }
    // Create a "section" string from 100 words before and after
    const start = Math.max(0, index - 100);
    const end = Math.min(words.length, index + 100);
    const section = words.slice(start, end).join(' ');

    // Normalize the section for comparison
    const normalizedSection = section.replace(/\s+/g, '').toLowerCase();

    // Check if the normalized section contains any normalized keyword
    if (normalizedKeywords.some(keyword => normalizedSection.includes(keyword))) {
        relevantSections.push(section);
        // If a keyword is found, skip the next 100 words before analyzing again.
        skipUntil = index + 100;
    }
  });
  return relevantSections.join('\n\n');
}


/**
 * Loads content from the provided URLs using Puppeteer.
 * @param {Array} urls - List of URLs to load.
 * @returns {Array} documentsArr - Array of document contents loaded from each URL.
*/
async function loadDocumentsFromUrls(urls) {
  console.log('urls = ' + urls)
  const documentsArr = [];

  for (let url of urls) {
    try {
      if (url.endsWith('.pdf')) {
        // * Implementation with axios
        const start = Date.now();
        const response = await axios.get(url, { responseType: 'arraybuffer'});
        const data = await pdf(response.data);
        const content = data.text;
        const end = Date.now();
        console.log('Fetched PCF Data:', content);
        console.log(`Document Load Time: ${end - start} ms`);
        documentsArr.push({ url, content });
      } else {
        console.log('TEXT/HTML detected');
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const content = $('body').text();
        documentsArr.push({ url, content });
      }
    } catch (error) {
      console.error(`Error scraping content from ${url}:`, error);
    }
    return documentsArr;
  }
}


/**
 * This function reads the content of a specified file, appends a predefined instruction
 * along with the input text, and returns the updated content as a string.
 *
 * @param {string} text - The input text that will be analyzed.
 * @returns {Promise<string>} - A promise that resolves to the full content of the file
 * including the appended instruction and input text.
 */
async function extractSourcesFromText(text) {
  return new Promise(async (resolve, reject) => {
    try {
      const originalContent = await fs.readFileSync(gptPromptDataFilePath, 'utf8');
      const instruction = `\nThis is the input text you are to analyze: ${text}\n`;
      const updatedContent = originalContent + instruction;
      // Resolve the promise with the updated content
      resolve(updatedContent);
    } catch (error) {
      reject(new Error(`Error reading or processing the file: ${error.message}`));
    }
  });
}

module.exports = { analyzeEnvironmentalReports, getRelevantCarbonInfo, loadDocumentsFromUrls, extractSourcesFromText}