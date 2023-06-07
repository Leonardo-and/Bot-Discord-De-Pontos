const Discord = require("discord.js");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("pontos")
    .setDescription("Ativar a consulta de pontos!")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embedPontos = new Discord.EmbedBuilder()
      .setTitle("🎖️ Pontos e patente 🎖️")
      .setColor("Random")
      .addFields({
        value:
          "Clique no botão abaixo para consultar seus pontos! Para realizar a ação, você precisa do seu ID da Steam. Não sabe como ver ele? Acesse o link: https://steamid.io e coloque o seu nome de usuário Steam.",
        name: "Consulta de pontos",
      });

    const button = new Discord.ButtonBuilder()
      .setCustomId("pointsBtn")
      .setLabel("Clique aqui!")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji("👆");

    const btn = new Discord.ActionRowBuilder().addComponents(button);

    interaction.reply({ embeds: [embedPontos], components: [btn] });
  },
};
