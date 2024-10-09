const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("information")
        .setDescription("Show guild or user information.")
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Guild or user ID.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Add or remove')
                .addChoices(
                    { name: "guild", value: "guild" },
                    { name: "user", value: 'user' },
                )
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const id = interaction.options.getString('id');
        const category = interaction.options.getString('category');
        const errorEmbed = new EmbedBuilder()
            .setTitle("Error")
            .setDescription("An error has occurred.")
            .setColor("Red");
        try {
            if (category === 'guild') {
                const guild = await client.guilds.cache.get(id);
                if (!guild) {
                    const guildNotFoundEmbed = new EmbedBuilder()
                        .setDescription("Guild not found.")
                    await interaction.reply({
                        content: "",
                        embeds: [guildNotFoundEmbed],
                        ephemeral: true,
                    });
                }
                const guildInfomationEmbed = new EmbedBuilder()
                    .setTitle(guild.name)
                    .addFields(
                        { name: "id", value: guild.id.toString(), inline: false },
                        { name: "member", value: guild.memberCount.toString(), inline: false }
                    )
                    .setThumbnail(guild.iconURL())
                    .setColor("Blue");
                await interaction.reply({
                    content: "",
                    embeds: [guildInfomationEmbed],
                });
            }
            if (category === 'user') {
                const user = await client.users.cache.get(id);
                if (!user) {
                    const userNotFoundEmbed = new EmbedBuilder()
                        .setDescription("User not found.")
                    await interaction.reply({
                        content: "",
                        embeds: [userNotFoundEmbed],
                        ephemeral: true,
                    });
                }
                const userInfomationEmbed = new EmbedBuilder()
                    .setTitle(user.displayName)
                    .addFields(
                        { name: "id", value: user.id.toString(), inline: false },
                        { name: "tag", value: user.username, inline: false },
                    )
                    .setThumbnail(user.displayAvatarURL())
                    .setColor("Blue");
                await interaction.reply({
                    content: "",
                    embeds: [userInfomationEmbed],
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
