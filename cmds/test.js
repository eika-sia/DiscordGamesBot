const { msgEmbed } = require("discord.js");
module.exports.run = async (bot, msg, args, db, userId) => {
  let strings = ["Success!", "Success2!"];
  let msgs = [];

  for (i=0; i<strings.length; i++) {
    let themMsg = await msg.channel.send(strings[i]);
    msgs.push(themMsg);
  }

  for (j = 0; j<strings.length; j++) {
    console.log(msgs[j].content === strings[j]);
  }
};
module.exports.help = {
  name: "test",
};
