const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");
const { getToken } = require("../../Functions/getToken");
const { request } = require('undici');
const fs = require('fs');
module.exports = {
  data: new SlashCommandBuilder()
    .setName("addition")
    .setDescription("Add members to your guild.")
    .addStringOption(option =>
      option.setName("user_id")
        .setDescription("User ID of the user to add.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const userId = interaction.options.getString('user_id');
    const blacklistFilePath = "./Database/blacklist.json";
    const blacklist = JSON.parse(fs.readFileSync(blacklistFilePath, 'utf-8')).blacklist;
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");
    const supportGuildButton = new ButtonBuilder()
      .setLabel("Support")
      .setStyle(ButtonStyle.Link)
      .setURL(process.env.supportGuild);
    const addBotButton = new ButtonBuilder()
      .setLabel("Invite")
      .setStyle(ButtonStyle.Link)
      .setURL(process.env.botInvite);
    const additionButtonRow = new ActionRowBuilder()
      .addComponents(supportGuildButton, addBotButton);
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const noPermissionEmbed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription("You do not have permission to use this command.")
          .setColor("Red");
        return interaction.reply({
          content: "",
          embeds: [noPermissionEmbed],
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
          components: [additionButtonRow],
          ephemeral: true,
        });
      }
      await interaction.reply({
        content: "Adding members...",
      });
      const accessToken = await getToken(userId);
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
      const response = await request("https://discord.com/api/guilds/" + interaction.guild.id + "/members/" + userId, options);
      if (response.statusCode === 201) {
        const successEmbed = new EmbedBuilder()
          .setTitle("Success")
          .setDescription("Succeeded in adding users.")
          .setColor("Green");
        await interaction.editReply({
          content: "",
          embeds: [successEmbed],
          components: [additionButtonRow],
        });
      } else if (response.statusCode === 204) {
        const alreadyEmbed = new EmbedBuilder()
          .setTitle("Already")
          .setDescription("User has already been added.")
          .setColor("Blue");
        await interaction.editReply({
          content: "",
          embeds: [alreadyEmbed],
          components: [additionButtonRow],
        });
      } else {
        const failedEmbed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription("Adding user failed.")
          .setColor("Red");
        await interaction.editReply({
          content: "",
          embeds: [failedEmbed],
          components: [additionButtonRow],
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "",
        embeds: [errorEmbed],
      });
    }
  }
};
