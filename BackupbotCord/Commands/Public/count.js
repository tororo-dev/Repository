const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");
const { countToken } = require("../../Functions/countToken");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("count")
    .setDescription("Count saved users."),
  async execute(interaction, client) {
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
    const countButtonRow = new ActionRowBuilder()
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
          ephemeral: true,
        });
      }
      const tokens = await countToken();
      const countEmbed = new EmbedBuilder()
        .setTitle("Token Count")
        .setDescription(tokens)
        .setColor("Blue");
      await interaction.reply({
        content: "",
        embeds: [countEmbed],
        components: [countButtonRow],
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
