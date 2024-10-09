const fs = require('fs');
function getAllTokens() {
  try {
    const tokenFilePath = "./Database/tokens.json";
    const fileContent = fs.readFileSync(tokenFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const tokens = Object.keys(data).map(key => ({ key, value: data[key] }));
    return tokens;
  } catch (error) {
    console.error(error);
    return [];
  }
}
module.exports = { getAllTokens };
