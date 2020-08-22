const { msgEmbed } = require("discord.js");
module.exports.run = async (bot, msg, args, db, userId) => {
  msg.channel.send("Success")
  /*
    const Reactionfilter = (reaction, user) => {
      return user.id === msg.author.id;
    };

    let collector = message.createReactionCollector(Reactionfilter, {
      time: 15000,
    });
    
    collector.on("collect", (reaction, user) => {
      if (reaction.emoji.name === "👎") {
        msg.channel.send("F");
        collector.stop();
      } else {
        msg.channel.send("Collected!");

        const userReactions = message.reactions.cache.filter((reaction) =>
          reaction.users.cache.has(userId)
        );
        try {
          for (const reaction of userReactions.values()) {
            reaction.users.remove(userId);
          }
        } catch (error) {
          console.error("Failed to remove reactions.");
        }
        Timeout = false;
        collector.stop();
      }
    });*/
};
module.exports.help = {
  name: "test",
};
