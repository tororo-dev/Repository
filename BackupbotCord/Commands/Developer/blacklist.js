const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Add to or remove from blacklist.")
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('User ID of the user to add or remove.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Add or remove')
                .addChoices(
                    { name: "add", value: "add" },
                    { name: "remove", value: 'remove' },
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.options.getString('user_id');
        const category = interaction.options.getString('category');
        const blacklistFilePath = "./Database/blacklist.json";  
        const errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error has occurred.")
            .setColor("Red");
        try {
            const blacklistFile = JSON.parse(fs.readFileSync(blacklistFilePath));
            if (category === 'add') {
                if (blacklistFile.blacklist.includes(userId)) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(userId + " is already in the blacklist.")
                        .setColor("Red");
                    return interaction.reply({
                        embeds: [errorEmbed],
                    });
                }
                blacklistFile.blacklist.push(userId);
                fs.writeFileSync(blacklistFilePath, JSON.stringify(blacklistFile, null, 2));
                const successEmbed = new EmbedBuilder()
                    .setTitle("Success")
                    .setDescription("Successfully added " + userId + " to the blacklist.")
                    .setColor("Green");
                await interaction.reply({
                    embeds: [successEmbed],
                });
            }
            if (category === 'remove') {
                if (!blacklistFile.blacklist.includes(userId)) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(interaction.guild.id + " is not in the blacklist.")
                        .setColor("Red");
                    return interaction.reply({
                        embeds: [errorEmbed],
                    });
                }
                blacklistFile.blacklist = blacklistFile.blacklist.filter(
                    (id) => id !== userId
                );
                fs.writeFileSync(blacklistFilePath, JSON.stringify(blacklistFile, null, 2));
                const successEmbed = new EmbedBuilder()
                    .setTitle("Success")
                    .setDescription("Successfully removed " + userId + " from the blacklist.")
                    .setColor("Green");
                await interaction.reply({
                    embeds: [successEmbed],
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "",
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};
