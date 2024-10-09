const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the guild.")
    .addStringOption(option =>
      option.setName("guild_id")
        .setDescription("Guild ID of the leaving guild")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const guildId = interaction.options.getString('guild_id');
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");
    const successEmbed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Succeeded leaving the guild.")
      .setColor("Green");
    const failedEmbed = new EmbedBuilder()
      .setTitle("Failed")
      .setDescription("Failed leaving the guild.")
      .setColor("Red");
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        await interaction.reply({
          content: "",
          embeds: [failedEmbed],
          ephemeral: true,
        });
      }
      await guild.leave();
      await interaction.reply({
        content: "",
        embeds: [successEmbed],
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
