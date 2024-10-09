const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("guilds")
    .setDescription("Show all guilds."),
  async execute(interaction, client) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");
    try {
      const previousButton = new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary);
      const nextPageButton =new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary);
      const guilds = client.guilds.cache.map((guild) =>
        guild.name + "(" + guild.id + ")"
      );
      const guildsPerPage = 10;
      const guildsPageArray = [];
      for (let i = 0; i < guilds.length; i += guildsPerPage) {
        guildsPageArray.push(guilds.slice(i, i + guildsPerPage));
      }
      let pageNumber = 0;
      const paginationButtonRow = new ActionRowBuilder()
        .addComponents(nextPageButton, previousButton);
      const firstPage = guildsPageArray[0];
      const guildsEmbed = new EmbedBuilder()
        .setTitle("Guilds")
        .setDescription(firstPage.join("\n"))
        .setColor("Blue");
      interaction.reply({
        embeds: [guildsEmbed],
        components: [paginationButtonRow],
      });
      client.on("interactionCreate", async (interaction) => {
        if (interaction.isButton()) {
          if (interaction.customId === "previous") {
            if (pageNumber === 0) {
              const firstPageEmbed = new EmbedBuilder()
                .setDescription("This is the last page.")
                .setColor("Red");
              return interaction.reply({
                embeds: [firstPageEmbed],
                ephemeral: true,
              });
            } else {
              pageNumber--;
              const currentPage = guildsPageArray[pageNumber];
              const guildsEmbed = new EmbedBuilder()
                .setTitle("Guilds")
                .setDescription(currentPage.join("\n"))
                .setColor("Blue");
              await interaction.update({
                embeds: [guildsEmbed],
                components: [paginationButtonRow],
              });
            }
          }
          if (interaction.customId === "next") {
            if (pageNumber === guildsPageArray.length - 1) {
              const lastPageEmbed = new EmbedBuilder()
                .setDescription("This is the first page.")
                .setColor("Red");
              return interaction.reply({
                embeds: [lastPageEmbed],
                ephemeral: true,
              });
            } else {
              pageNumber++;
              const currentPage = guildsPageArray[pageNumber];
              const guildsEmbed = new EmbedBuilder()
                .setTitle("Guilds")
                .setDescription(currentPage.join("\n"))
                .setColor("Blue");
              await interaction.update({
                embeds: [guildsEmbed],
                components: [paginationButtonRow],
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
