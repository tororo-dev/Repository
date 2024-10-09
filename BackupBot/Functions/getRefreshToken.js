const fs = require('fs');
function getRefreshToken(userId) {
  try {
    const refreshTokenFilePath = "./Database/refreshTokens.json"
    const fileContent = fs.readFileSync(refreshTokenFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (data.hasOwnProperty(userId)) {
      return data[userId];
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports = { getRefreshToken };
