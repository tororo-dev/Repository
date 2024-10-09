const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { loadEvents } = require("./Handlers/eventHandler");
require('./server.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.ThreadMember
  ],
});
client.events = new Collection();
client.commands = new Collection()
loadEvents(client);
client.login(process.env.token);
