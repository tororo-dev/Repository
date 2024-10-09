const { ActivityType, WebhookClient, EmbedBuilder } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const { countToken } = require("../../Functions/countToken");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Client logged is as ${client.user.username}`);
    let switchActivity = true;
    setInterval(() => { 
      if (switchActivity) {
        client.user.setActivity(`${client.guilds.cache.size} servers`, { type: ActivityType.Watching });
      } else {
        client.user.setActivity(`${countToken()} backup members`, { type: ActivityType.Watching });
      }
      switchActivity = !switchActivity;
    }, 5000);
    client.user.setStatus(process.env.status);
    loadCommands(client);
    const webhookClient = new WebhookClient({
      id: process.env.webhookId,
      token: process.env.webhookToken
    });
    const tokens = countToken();
    const readyEmbed = new EmbedBuilder()
      .setTitle("Ready Log")
      .setColor("Blue")
      .addFields(
        { name: "Bot", value: client.user.displayName, inline: false },
        { name: "Guilds", value: client.guilds.cache.size.toString(), inline: false },
        { name: "Backup Members", value: tokens.toString(), inline: false },
      );
    webhookClient.send({
      username: process.env.webhookName,
      avatarURL: process.env.webhookAvatar,
      content: "",
      embeds: [readyEmbed],
    });
  },
};
