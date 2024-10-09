const fs = require('fs');
function getToken(userId) {
  try {
    const tokenFilePath = "./Database/tokens.json"
    const fileContent = fs.readFileSync(tokenFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (data.hasOwnProperty(userId)) {
      return data[userId];
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports = { getToken };
