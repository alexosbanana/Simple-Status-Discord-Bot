require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const STATUS_CHANNEL_ID = 'STATUS Channel ID'; // Kanal für Status-Embed

// Array mit Objekten: { id: Bot-ID, name: Bot-Name }
const MONITORED_BOTS = [
  { id: 'Application ID', name: 'Alexos' },
  // weitere Bots hier hinzufügen
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // wichtig für Status
  ],
});


async function updateStatus() {
  const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
  if (!channel) return console.log('Status-Channel nicht gefunden');

  let description = '';
  for (const bot of MONITORED_BOTS) {
    let status = '❌ Offline';

    for (const guild of client.guilds.cache.values()) {
      const member = await guild.members.fetch(bot.id).catch(() => null);
      if (member) {
        status = member.presence?.status === 'offline' || !member.presence ? '⚪ Offline' : `🟢 ${member.presence.status}`;
        break; // Bot gefunden, Status ermittelt
      }
    }

    description += `**${bot.name}** (\`${bot.id}\`) - Status: ${status}\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle('📊 Status aller Bots')
    .setColor('Blue')
    .setDescription(description)
    .setTimestamp();

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessage = messages.find(m => m.author.id === client.user.id);
  if (botMessage) {
    await botMessage.edit({ embeds: [embed] });
  } else {
    await channel.send({ embeds: [embed] });
  }
}

client.once('ready', () => {
  console.log(`✅ Status-Bot online als ${client.user.tag}`);

  updateStatus();
  setInterval(updateStatus, 60 * 1000); // alle 60 Sekunden aktualisieren
});

client.login(process.env.BOT_TOKEN);
