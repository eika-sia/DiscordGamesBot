const discord = require("discord.js");
module.exports.run = async (bot, msg, args, db, userId) => {
  let argsF = new Array();
  argsF = args;

  if (argsF.length === 0) {
    const Help = new discord.MessageEmbed()
      .setTitle("How to play Rock paper scissors!")
      .addFields({
        name: "How to choose your guess?",
        value: "select on of the emojies on your msg in 10 sec",
      });
    msg.channel.send(Help);
  } else if (args[0] === "start") {
    //🥌 📰 ✂️
    msg.react("🥌");
    msg.react("📰");
    msg.react("✂️");
    let Alert = await msg.channel.send("Please wait 3 seconds");
    function delMsg() {
      Alert.edit("You can choose now");
      setTimeout(function () {
        Alert.delete();
      }, 2000);
    }
    setTimeout(function () {
      delMsg();
      Gameplay();
    }, 3000);

    let PlayerChoice;
    let BotChoice;
    function Gameplay() {
      const Reactionfilter = (reaction, user) => {
        if (user != "739459677296787506") {
          let tempUser = String(user);
          tempUser = tempUser.slice(0, tempUser.length - 1);
          tempUser = tempUser.slice(1);
          tempUser = tempUser.slice(1);
          if (tempUser === userId) {
            return true;
          }
        }
      };

      const ReactionCollector = msg.createReactionCollector(Reactionfilter, {
        time: 10000,
      });

      ReactionCollector.on("collect", (react, user) => {
        if (react.emoji.name === "🥌") {
          PlayerChoice = 1;
          ReactionCollector.stop();
        } else if (react.emoji.name === "📰") {
          PlayerChoice = 2;
          ReactionCollector.stop();
        } else if (react.emoji.name === "✂️") {
          PlayerChoice = 3;
          ReactionCollector.stop();
        }
      });

      ReactionCollector.on("end", (collected) => {
        if (collected.size === 0) {
          msg.channel.send("Nothing collected, try again");
        } else {
          BotChoice = Math.floor(Math.random() * 2) + 1;
          console.log(`${PlayerChoice} ${BotChoice}`);
          if (BotChoice === 1 && PlayerChoice === 2) {
            msg.channel.send(`You win - bots choice ${BotChoice}`);
          } else if (BotChoice === 2 && PlayerChoice === 3) {
            msg.channel.send(`You win - bots choice ${BotChoice}`);
          } else if (BotChoice === 3 && PlayerChoice === 1) {
            msg.channel.send(`You win - bots choice ${BotChoice}`);;
          } else if (BotChoice === PlayerChoice) {
            msg.channel.send("Draw try again!");

            const userReactions = msg.reactions.cache.filter((reaction) =>
              reaction.users.cache.has(userId)
            );
            try {
              for (const reaction of userReactions.values()) {
                reaction.users.remove(userId);
              }
            } catch (error) {
              console.error("Failed to remove reactions.");
            }

            return Gameplay();
          } else {
            msg.channel.send(`You loose`);
          }
        }
      });
    }
  }
};
module.exports.help = {
  name: "rpc",
};
