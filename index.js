const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const Discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
const { TOKEN, DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DATABASE } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Pronto! Bot logado como ${c.user.tag}!`);
});

client.login(TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[AVISO] O comando localizado no caminho ${filePath} está faltando o "data" ou o "execute".`
    );
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `Nenhum comando chamado ${interaction.commandName} foi encontrado.`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Ocorreu um erro ao executar esse comando!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Ocorreu um erro ao executar esse comando!",
        ephemeral: true,
      });
    }
  }
});

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DATABASE,
  port: DB_PORT,
  connectTimeout: 20000,
});

db.connect((error) => {
  if (error) {
    console.log("Ocorreu um erro ao conectar a base de dados! " + error);
    return;
  }
  console.log("Conexão bem sucedida com a base de dados!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "pointsBtn") {
      const modal = new Discord.ModalBuilder()
        .setCustomId("modal")
        .setTitle("Insira o seu ID da Steam:")
        .setComponents(
          new Discord.ActionRowBuilder().setComponents(
            new Discord.TextInputBuilder()
              .setCustomId("input")
              .setLabel("ID")
              .setRequired(true)
              .setStyle(Discord.TextInputStyle.Short)
          )
        );

      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "modal") {
      const id = interaction.fields.getTextInputValue("input");
      const embed = new Discord.EmbedBuilder().setTitle(id);

      db.query(
        `select amount from pontos where id = ${id}`,
        async (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
          if (results.length === 0) {
            const embed = new Discord.EmbedBuilder()
              .setTitle("Pontos")
              .addFields({
                name: `Não foi possível encontrar consultar seus pontos!`,
                value: `Verifique se o seu ID Steam está correto e tente novamente. Caso o erro persista, contate algum moderador!`,
              })
              .setFooter({ text: `Steam ID: ${id}` });
            interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
            return;
          }
          if (results) {
            const embed = new Discord.EmbedBuilder()
              .setTitle("Pontos")
              .addFields({
                name: `Você tem ${results[0].amount} pontos!`,
                value: ``,
              })
              .setFooter({ text: `Steam ID:  ${id} ` });

            interaction.reply({ embeds: [embed], ephemeral: true });
          }
        }
      );
    }
  }
});