const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, WebhookClient } = require("discord.js");
const { getAllTokens } = require("../../Functions/getAllTokens");
const { getRefreshToken } = require("../../Functions/getRefreshToken");
const { updateToken } = require("../../Functions/updateToken");
const { request } = require('undici');
const fs = require('fs');
const path = require('path');
module.exports = {
  data: new SlashCommandBuilder()
    .setName("call")
    .setDescription("Add all members to your guild."),
  async execute(interaction, client) {
    const blacklistFilePath = "./Database/blacklist.json";
    const tokensFilePath = path.join(__dirname, '../../Database/tokens.json');
    const blacklist = JSON.parse(fs.readFileSync(blacklistFilePath, 'utf-8')).blacklist;
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");
    const supportServerButton = new ButtonBuilder()
      .setLabel("Support")
      .setStyle(ButtonStyle.Link)
      .setURL(process.env.supportGuild);
    const addBotButton = new ButtonBuilder()
      .setLabel("Invite")
      .setStyle(ButtonStyle.Link)
      .setURL(process.env.botInvite);
    const callButtonRow = new ActionRowBuilder()
      .addComponents(supportServerButton, addBotButton);
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const noPermissionEmbed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription("You do not have permission to use this command.")
          .setColor("Red");
        return interaction.reply({
          content: "",
          embeds: [noPermissionEmbed],
          ephemeral: true,
        });
      }
      if (blacklist.includes(interaction.user.id)) {
        const blacklistEmbed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription("You are in blacklist.")
          .setColor("Red");
        return interaction.reply({
          content: "",
          embeds: [blacklistEmbed],
          components: [callButtonRow],
          ephemeral: true,
        });
      }
      const firstMember = interaction.guild.memberCount.toString();
      await interaction.reply({
        content: "Calling members...",
      });
      const tokens = getAllTokens();
      let successCount = 0;
      let alreadyCount = 0;
      let failedCount = 0;
      for (let i = 0; i < tokens.length; i++) {
        const userId = tokens[i].key;
        let accessToken = tokens[i].value;
        let response;
        try {
          const options = {
            headers: {
              'Authorization': `Bot ${process.env.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ access_token: accessToken })
          };
          response = await request(`https://discord.com/api/guilds/${interaction.guild.id}/members/${userId}`, options);
          if (response.statusCode === 201) {
            successCount++;
          } else if (response.statusCode === 204) {
            alreadyCount++;
          } else if (response.statusCode === 403) {
            const refreshToken = getRefreshToken(userId);
            accessToken = await updateToken(userId, refreshToken);
            const retryOptions = {
              headers: {
                'Authorization': `Bot ${process.env.token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ access_token: accessToken })
            };
            response = await request(`https://discord.com/api/guilds/${interaction.guild.id}/members/${userId}`, retryOptions);
            if (response.statusCode === 201) {
              successCount++;
            } else if (response.statusCode === 204) {
              alreadyCount++;
            } else {
              failedCount++;
            }
          } else {
            failedCount++;
          }
        } catch (err) {
          console.error(err);
          failedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const resultEmbed = new EmbedBuilder()
        .setTitle("Result")
        .setColor("Blue")
        .addFields(
          { name: "Success", value: successCount.toString(), inline: false },
          { name: "Already", value: alreadyCount.toString(), inline: false },
          { name: "Failed", value: failedCount.toString(), inline: false },
          { name: "Guild Members", value: `${firstMember} => ${interaction.guild.memberCount.toString()}`, inline: false },
        );
      await interaction.editReply({
        content: "",
        embeds: [resultEmbed],
        components: [callButtonRow],
      });
      const callLogEmbed = new EmbedBuilder()
        .setTitle("Call Log")
        .setColor("Blue")
        .addFields(
          { name: "User", value: `${interaction.user.username}(${interaction.user.id.toString()})`, inline: false },
          { name: "Guild", value: `${interaction.guild.name}(${interaction.guild.id.toString()})`, inline: false },
          { name: "Guild Members", value: `${firstMember} => ${interaction.guild.memberCount.toString()}`, inline: false },
        );
      const webhookClient = new WebhookClient({
        id: process.env.webhookId,
        token: process.env.webhookToken
      });
      await webhookClient.send({
        username: process.env.webhookName,
        avatarURL: process.env.webhookAvatar,
        content: "",
        embeds: [resultEmbed, callLogEmbed],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "",
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  }
};
