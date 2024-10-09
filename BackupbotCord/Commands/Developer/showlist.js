const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("showlist")
        .setDescription("Show blacklist."),
    async execute(interaction, client) {
        const blacklistFilePath = "./Database/blacklist.json";
        const errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error has occurred.")
            .setColor("Red");
        try {
            const blacklist = JSON.parse(fs.readFileSync(blacklistFilePath)).blacklist;
            const blacklistEmbed = new EmbedBuilder()
                .setTitle("Blacklist")
                .setDescription(blacklist.join("\n") || "No users in the blacklist.")
                .setColor("Blue");
            await interaction.reply({
                content: "",
                embeds: [blacklistEmbed],
            });
        } catch (error) {
            console.error(error);
            await reply({
                content: "",
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};
