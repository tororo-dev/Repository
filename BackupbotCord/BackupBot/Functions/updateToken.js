const { request } = require('undici');
const fs = require('fs');
async function updateToken(userId, refreshToken) {
  const refreshTokenResponseData = await request('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.id,
      client_secret: process.env.secret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: process.env.redirect,
      scope: 'identify',
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const responseJson = await refreshTokenResponseData.body.json();
  const newAccessToken = responseJson.access_token;
  const tokensData = JSON.parse(fs.readFileSync(tokensFilePath, 'utf-8'));
  const tokenIndex = tokensData.tokens.findIndex(token => token.key === userId);
  if (tokenIndex !== -1) {
    tokensData.tokens[tokenIndex].value = newAccessToken;
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokensData, null, 2));
  }
  return newAccessToken;
}
module.exports = { updateToken };
