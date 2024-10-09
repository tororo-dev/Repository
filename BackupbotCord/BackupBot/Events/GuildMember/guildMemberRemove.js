const { getToken } = require("../../Functions/getToken");
const { request } = require('undici');
const fs = require("fs");
module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const rejoinGuildFilePath = "./Database/rejoinGuild.json";
    const rejoinGuild = JSON.parse(fs.readFileSync(rejoinGuildFilePath, 'utf-8')).guilds;
    if (rejoinGuild.includes(member.guild.id)) {
      const accessToken = await getToken(member.id);
      if (!accessToken) return;
      const data = {
        access_token: accessToken,
      };
      const options = {
        headers: {
          'Authorization': "Bot " + process.env.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      await request("https://discord.com/api/guilds/" + member.guild.id + "/members/" + member.id, options);
    }
  },
};
