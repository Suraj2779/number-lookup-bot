const axios = require('axios');
const config = require('../config');

// Fetch and format API response
async function lookupNumber(number) {
  const url = `${config.API_URL}?number=${number}`;
  const response = await axios.get(url);
  const data = response.data;

  // Exclude hidden fields
  const hidden = ['number_info', 'developer', 'telegram'];
  const filtered = Object.keys(data)
    .filter(key => !hidden.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  // Build formatted output
  let output = '';
  for (const [key, value] of Object.entries(filtered)) {
    output += `🔹 ${key}: ${value}\n`;
  }
  output += '━━━━━━━━━━━━━━\nDev by Raghav~ 👈';
  return output;
}

module.exports = { lookupNumber };

