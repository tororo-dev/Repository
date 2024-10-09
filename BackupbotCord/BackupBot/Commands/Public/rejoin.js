const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, GuildScheduledEvent } = require("discord.js");
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("rejoin")
        .setDescription("Automatically rejoin user.")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Whether auto user rejoin mode is on or off.')
                .addChoices(
                    { name: "on", value: "on" },
                    { name: "off", value: 'off' },
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        const rejoinGuildFilePath = "./Database/rejoinGuild.json";  
        const errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error has occurred.")
            .setColor("Red");
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
        try {
            const rejoinGuildFile = JSON.parse(fs.readFileSync(rejoinGuildFilePath));
            if (mode === 'on') {
                if (rejoinGuildFile.guilds.includes(interaction.guild.id)) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(interaction.guild.id + " already has rejoin enabled.")
                        .setColor("Red");
                    return interaction.reply({
                        embeds: [errorEmbed],
                    });
                }
                rejoinGuildFile.guilds.push(interaction.guild.id);
                fs.writeFileSync(rejoinGuildFilePath, JSON.stringify(rejoinGuildFile, null, 2));
                const successEmbed = new EmbedBuilder()
                    .setTitle("Success")
                    .setDescription("Rejoin successfully enabled for " + interaction.guild.id + " .")
                    .setColor("Green");
                await interaction.reply({
                    embeds: [successEmbed],
                });
            } else if (mode === 'off') {
                if (!rejoinGuildFile.guilds.includes(interaction.guild.id)) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(interaction.guild.id + " already has rejoin disabled.")
                        .setColor("Red");
                    return interaction.reply({
                        embeds: [errorEmbed],
                    });
                }
                rejoinGuildFile.guilds = rejoinGuildFile.guilds.filter(
                    (id) => id !== interaction.guild.id
                );
                fs.writeFileSync(rejoinGuildFilePath, JSON.stringify(rejoinGuildFile, null, 2));
                const successEmbed = new EmbedBuilder()
                    .setTitle("Success")
                    .setDescription("Rejoin successfully disabled for " + interaction.guild.id + " .")
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
