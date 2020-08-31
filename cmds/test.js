const { msgEmbed } = require("discord.js");
module.exports.run = async (bot, msg, args, db, userId) => {
  msg.channel.send("Success!");
};
module.exports.help = {
  name: "test",
};
