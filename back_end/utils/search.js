
'use strict';

const GOOGLE_CS_KEY = process.env.GOOGLE_CS_KEY;
const GOOGLE_CS_CX = process.env.GOOGLE_CS_CX;

// Converts a Google sustainability report URL to a direct PDF link
function convertGoogleReportUrl(url) {
  // Split the URL by slashes, filter out any empty parts, and take the last item
  const parts = url.split('/').filter(part => part !== '');
  const reportName = parts.pop();
  console.log('REPORT NAME = ' + reportName);
  const newUrl = `https://www.gstatic.com/gumdrop/sustainability/${reportName}.pdf`;
  return newUrl;
}

// Searches for Product Carbon Footprint (PCF) reports on Google and returns processed document URLs
async function productPCFGoogleSearch(productName, numResults = 2) {
  const queries = [
    `Carbon Footprint of ${productName}`
  ];
  const urls = [];
  let start = new Date().getTime();
  for (const query of queries) {
    const searchResults = await googleSearch(query, numResults);
    for (const url of searchResults) {
      if (productName.includes('Google') && url.includes('sustainability.google/reports/')) {
        urls.push(convertGoogleReportUrl(url));
      } else {
        urls.push(url);
      }
    }
  }
  let end = new Date().getTime();
  console.log(`Google Search: ${(end - start) / 1000} seconds`);
  start = new Date().getTime();
  const documents = await loadDocumentsFromUrls(urls);
  end = new Date().getTime();
  console.log(`Doc load: ${(end - start) / 1000} seconds`);

  return documents;
}

// Fetch search results from Google using google custom search API
async function googleSearch(query, numResults) {
  // const pdfQuery = `${query} filetype:pdf`;
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CS_KEY}&cx=${GOOGLE_CS_CX}&q=${encodeURIComponent(query)}&num=${numResults}`;
  const response = await fetch(searchUrl);
  const data = await response.json();
  return data.items.map(item => item.link);
}

async function openAISearch(query) {

}

module.exports = { convertGoogleReportUrl, productPCFGoogleSearch, googleSearch }