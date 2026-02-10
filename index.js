require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const SUPPORT_ROLE_ID = process.env.SUPPORT_ROLE_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;

client.once("ready", () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);
});

// ===== PANEL TICKET (SLASH COMMAND) =====
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticketpanel") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("🎫 Open Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: "Klik tombol di bawah untuk membuka ticket",
        components: [row],
      });
    }
  }

  if (!interaction.isButton()) return;

  // ===== CREATE TICKET =====
  if (interaction.customId === "create_ticket") {
    const guild = interaction.guild;
    const user = interaction.user;

    const existing = guild.channels.cache.find(
      (c) => c.name === `ticket-${user.id}`
    );
    if (existing)
      return interaction.reply({
        content: "❌ Kamu masih punya ticket aktif.",
        ephemeral: true,
      });

    const channel = await guild.channels.create({
      name: `ticket-${user.id}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: ADMIN_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
