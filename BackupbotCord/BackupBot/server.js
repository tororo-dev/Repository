const { request } = require('undici');
const express = require('express');
const fs = require("fs");
const { EmbedBuilder, WebhookClient, Client, GatewayIntentBits, Partials } = require('discord.js');
const { fetchJson } = require("./Functions/fetchJson");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.ThreadMember
  ],
});
client.login(process.env.token);
const app = express();
const port = process.env.port || 3000;
const webhookClient = new WebhookClient({
  id: process.env.webhookId,
  token: process.env.webhookToken
});
app.get('/callback', async ({ query }, response) => {
  const { code } = query;
  if (code) {
    try {
      const tokenResponseData = await request('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.id,
          client_secret: process.env.secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.redirect,
          scope: 'identify',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const oauthData = await tokenResponseData.body.json();
      const userResult = await request('https://discord.com/api/v10/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });
      const userData = await userResult.body.json();
      const userName = userData.username;
      const userAvatar = "https://cdn.discordapp.com/avatars/" + userData.id + "/" + userData.avatar + ".png";
      const tokenFilePath = "./Database/tokens.json";
      let tokenData = {};
      try {
        tokenData = JSON.parse(fs.readFileSync(tokenFilePath, "utf8"));
      } catch (error) {
        console.log(error)
      }
      tokenData[userData.id] = oauthData.access_token;
      fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2));
      const refreshTokenFilePath = "./Database/refreshTokens.json";
      let refreshTokenData = {};
      try {
          refreshTokenData = JSON.parse(fs.readFileSync(refreshTokenFilePath, "utf8"));
      } catch (error) {
        console.log(error)
      }
      refreshTokenData[userData.id] = oauthData.refresh_token;
      fs.writeFileSync(refreshTokenFilePath, JSON.stringify(refreshTokenData, null, 2));
      const apiKey = process.env.apiKey;
      const data = await fetchJson(`https://api.ipify.org/?format=json`);
      const vpnDetect = await fetchJson(`https://vpnapi.io/api/${data.ip}?key=${apiKey}`);
      console.log(vpnDetect)
      if (vpnDetect.security.vpn === true) {
        console.log('Use VPN');
      }
      const verifyLogEmbed = new EmbedBuilder()
        .setTitle("Verify Log")
        .addFields(
          { name: "Username", value: userData.username, inline: false },
          { name: "Id", value: userData.id.toString(), inline: false },
          { name: "Email", value: userData.email, inline: false },
          { name: "Ip", value: data.ip.toString(), inline: false }
        )
        .setColor("Blue");
      await webhookClient.send({
        content: "",
        username: process.env.webhookName,
        avatarURL: process.env.webhookAvatar,
        embeds: [verifyLogEmbed],
      });
      const guildId = BigInt("0x" + query.state.split("-")[0]).toString();
      const roleId = BigInt("0x" + query.state.split("-")[1]).toString();
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userData.id);
      const role = guild.roles.cache.get(roleId);
      if (role && member) {
        await member.roles.add(role);
      }
      const verifyHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Success</title>
          <style>
            body {
              background-color: #000;
              font-family: sans-serif;
              color: #fff;
              text-align: center;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .icon {
              position: relative;
              width: 150px;
              height: 150px;
              display: block;
              margin: auto;
              border: gray solid 2px;
              border-radius: 15px;
              top: 10px;
            }
            .box {
              border: gray solid 2px;
              border-radius: 15px;
              width: 300px;
              height: 400px;
              background-color: #222;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .success {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
              margin-top: 20px;
            }
            .checkmark {
              width: 30px;
              height: 30px;
              margin-right: 10px;
            }
            .button {
              margin-top: 20px;
              padding: 10px 20px;
              width: 200px;
              background-color: #7289da;
              border: none;
              border-radius: 5px;
              color: #fff;
              font-size: 16px;
              cursor: pointer;
              text-decoration: none;
              text-align: center;
            }
            .button:hover {
              background-color: #5b6eae;
            }
            .support-button {
              margin-top: 10px;
              background-color: #43b581;
            }
            .support-button:hover {
              background-color: #39a16f;
            }
          </style>
        </head>
        <body>
          <div class="box">
            <img class="icon" src="${userAvatar}">
            <br>
            <text>${userName}</text>
            <br>
            <div class="success">
              <img class="checkmark" src="https://s3.ap-northeast-1-ntt.wasabisys.com/ak1520d-filenow-2/files/20240721-1501_f8d731f7ea483a4631a1d91a6e05329c.png?response-content-disposition=attachment">
              <text>Success</text>
            </div>
            <br>
            <a class="button" href="https://discord.com/channels/@me">Return to Discord</a>
              <a class="button support-button" href="https://discord.gg/support-server-link">Support</a>
          </div>
        </body>
        </html>
      `;
      return response.send(verifyHtml);
    } catch (error) {
      console.error(error);
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>
            body {
              background-color: #000;
              font-family: sans-serif;
              color: #fff;
              text-align: center;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .box {
              border: gray solid 2px;
              border-radius: 15px;
              width: 300px;
              height: 400px;
              background-color: #222;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .error {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
              margin-top: 20px;
            }
            .errormark {
              width: 30px;
              height: 30px;
              margin-right: 10px;
            }
            .error-text {
              margin-top: 10px;
              font-size: 16px;
            }
            .button {
              margin-top: 20px;
              padding: 10px 20px;
              width: 200px;
              background-color: #7289da;
              border: none;
              border-radius: 5px;
              color: #fff;
              font-size: 16px;
              cursor: pointer;
              text-decoration: none;
              text-align: center;
            }
            .button:hover {
              background-color: #5b6eae;
            }
            .support-button {
              margin-top: 10px;
              background-color: #43b581;
            }
            .support-button:hover {
              background-color: #39a16f;
            }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="error">
              <img class="errormark" src="https://s3.ap-northeast-1-ntt.wasabisys.com/ak1520d-filenow-5/files/20240721-1501_c868266a7e1a151216c6d7ada8081ae8.png?response-content-disposition=attachment">
              <text>Error</text>
            </div>
            <div class="error-text">${error}</div>
            <a class="button" href="https://discord.com/channels/@me">Return to Discord</a>
            <a class="button support-button" href="https://discord.gg/support-server-link">Support</a>
          </div>
        </body>
        </html>
      `;
      return response.send(errorHtml);
    }
  }
});
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
