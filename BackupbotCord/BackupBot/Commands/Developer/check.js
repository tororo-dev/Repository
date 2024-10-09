const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check all guilds for the verify panel."),
  async execute(interaction, client) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("An error has occurred.")
      .setColor("Red");

    try {
      await interaction.reply("checking...");

      const keyword = 'Please verify.';
      const userId = client.user.id;
      const results = [];
      const guilds = client.guilds.cache;

      for (const [guildId, guild] of guilds) {
        let found = false;
        const everyoneRole = guild.roles.everyone;
        const channels = guild.channels.cache.filter(channel => channel.isTextBased());

        for (const [channelId, channel] of channels) {
          if (channel.permissionsFor(everyoneRole).has(PermissionsBitField.Flags.ViewChannel)) {
            const messages = await channel.messages.fetch({ limit: 100 });
            for (const message of messages.values()) {
              if (message.author.id === userId && message.content.includes(keyword)) {
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        results.push(`${guild.name} (${guild.id}): **${found ? "true" : "false"}**`);
      }

      const guildsPerPage = 10;
      const guildsPageArray = [];
      for (let i = 0; i < results.length; i += guildsPerPage) {
        guildsPageArray.push(results.slice(i, i + guildsPerPage));
      }

      let pageNumber = 0;

      const previousButton = new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary);

      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary);

      const paginationButtonRow = new ActionRowBuilder()
        .addComponents(previousButton, nextButton);

      const guildsEmbed = new EmbedBuilder()
        .setTitle("Verify Panel Check Results")
        .setDescription(guildsPageArray[0].join('\n'))
        .setColor("Blue");

      await interaction.editReply({
        content: "",
        embeds: [guildsEmbed],
        components: [paginationButtonRow],
      });
      client.on("interactionCreate", async (interaction) => {
        if (interaction.isButton()) {
          if (interaction.customId === "previous") {
            if (pageNumber === 0) {
              const firstPageEmbed = new EmbedBuilder()
                .setDescription("This is the first page.")
                .setColor("Red");
              return interaction.reply({
                embeds: [firstPageEmbed],
                ephemeral: true,
              });
            } else {
              pageNumber--;
              const currentPage = guildsPageArray[pageNumber];
              const guildsEmbed = new EmbedBuilder()
                .setTitle("Verify Panel Check Results")
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
                .setDescription("This is the last page.")
                .setColor("Red");
              return interaction.reply({
                embeds: [lastPageEmbed],
                ephemeral: true,
              });
            } else {
              pageNumber++;
              const currentPage = guildsPageArray[pageNumber];
              const guildsEmbed = new EmbedBuilder()
                .setTitle("Verify Panel Check Results")
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
      await interaction.editReply({
        content: "",
        embeds: [errorEmbed],
      });
    }
  }
};
