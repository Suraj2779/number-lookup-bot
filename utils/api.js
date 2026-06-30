const axios = require('axios');
const config = require('../config');

// Recursively flatten an object, excluding blacklisted keys
function flattenObject(obj, parentKey = '', result = {}, excludedKeys = ['number_info', 'developer', 'telegram']) {
  for (const [key, value] of Object.entries(obj)) {
    // Skip excluded keys
    if (excludedKeys.includes(key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, result, excludedKeys);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

// Fetch and format API response
async function lookupNumber(number) {
  const url = `${config.API_URL}?number=${number}`;
  const response = await axios.get(url);
  const data = response.data;

  // Flatten the entire object, excluding hidden fields
  const flat = flattenObject(data);

  // Build formatted output
  let output = '';
  for (const [key, value] of Object.entries(flat)) {
    // You can clean up the key names if desired (e.g., remove "number_detail." prefix)
    const displayKey = key.replace(/^number_detail\./, ''); // optional: remove prefix
    output += `🔹 ${displayKey}: ${value}\n`;
  }
  output += '━━━━━━━━━━━━━━\nDev by Raghav~ 👈';
  return output;
}

module.exports = { lookupNumber };
