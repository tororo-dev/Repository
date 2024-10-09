const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "interactionCreate",
  execute(interaction, client) {
    const notExistEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("This command does not exist.")
      .setColor("Red");
    const developerCommandEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("This command is a developer command.")
      .setColor("Red");
    if (!interaction.isChatInputCommand()) return;   
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "",
        embeds: [notExistEmbed],
        ephemeral: true,
      });
    if (command.developer && interaction.user.id !== process.env.developer)
      return interaction.reply({
        content: "",
        embeds: [developerCommandEmbed],
        ephemeral: true,
      });
    command.execute(interaction, client);
  },
};
