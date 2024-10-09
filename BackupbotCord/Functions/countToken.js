const fs = require('fs');
function countToken() {
  try {
    const tokenFilePath = "./Database/tokens.json";
    const jsonData = fs.readFileSync(tokenFilePath, 'utf8');
    const data = JSON.parse(jsonData);
    let count = 0;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && typeof data[key] === 'string') {
        count++;
      }
    }
    const tokenCountString = count.toString();
    return tokenCountString;
  } catch (error) {
    console.error(error);
  }
}
module.exports = { countToken };
