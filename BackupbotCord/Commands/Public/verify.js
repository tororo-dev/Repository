const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Set verify panel.")
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("Give role")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Embed title")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Embed description")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("label")
        .setDescription("Button label")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const label = interaction.options.getString('label');
    const role = interaction.options.getRole('role');
    const verifyEmbed = new EmbedBuilder()
      .setTitle(title || "Verifycation")
      .setDescription(description || "Verify by click the **[Verify]** button.")
      .setColor("Blue");
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");
    const verifyButton = new ButtonBuilder()
      .setLabel(label || "Varify")
      .setStyle(ButtonStyle.Link)
      .setURL(
        process.env.authUrl + "&state=" + BigInt(interaction.guild.id).toString(16).toUpperCase() + "-" + BigInt(role.id).toString(16).toUpperCase()
      );
    const verifyButtonRow = new ActionRowBuilder()
      .addComponents(verifyButton);
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
      await interaction.reply({
        content: "Set verify panel...",
        ephemeral: true,
      });
      await interaction.channel.send({
        content: "Please verify.",
        embeds: [verifyEmbed],
        components: [verifyButtonRow],
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
