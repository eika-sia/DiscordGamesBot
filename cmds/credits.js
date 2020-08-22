const discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, UserId) => {
  const embed = new discord.MessageEmbed()
    .setTitle("Credits!")
    .setColor("RANDOM")
    .addFields(
      { name: "Goran#0372", value: "Created, programmed and tested the bot" },
      {
        name: "roro, trapz and lucii",
        value: "Helped test everything better than I could",
      },
      { name: 'Bornaj', value: "Helped with theory for bots games"}
    )
    .setAuthor("The dev");
  msg.channel.send(embed);
};

module.exports.help = {
  name: "credits",
};
