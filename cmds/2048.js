const discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, userId) => {
  let argsF = new Array();
  argsF = args;

  if (argsF.length === 0) {
    let HelpEmbed = new discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("How to play 2048")
      .addFields(
        {
          name: "Push blocks so they combine",
          value: "idk what to tell you it's 2048",
        },
        {
          name: "how to move blocks",
          value: "It's reaction controls, like everywhere",
        }
      );
    msg.channel.send(HelpEmbed);
  } else if (args[0] === "start") {
    //numbers=  0, 1, 2,  3, 4,  5, 6,  7,  8,  9,   10
    //colors = 🟪 🟩 🟥 ⬜ 🟧 🟦 🟨 🟫  ⚪  🔵  🔴
    //values=   2, 4, 8, 16,32, 64,128,256,512,1024,2048
    function blockConst(number, color, value) {
      this.number = number;
      this.color = color;
      this.value = value;
    }

    let Block2 = new blockConst(0, "🟪", 2);
    let Block4 = new blockConst(1, "🟩", 4);
    let Block8 = new blockConst(2, "🟥", 8);
    let Block16 = new blockConst(3, "⬜", 16);
    let Block32 = new blockConst(4, "🟧", 32);
    let Block64 = new blockConst(5, "🟦", 64);
    let Block128 = new blockConst(6, "🟨", 128);
    let Block256 = new blockConst(7, "🟫", 256);
    let Block512 = new blockConst(8, "⚪", 512);
    let Block1024 = new blockConst(9, "🔵", 1024);
    let Block2048 = new blockConst(10, "🔴", 2048);

    const bg = 11;

    const TableRows = 4;
    const TableCols = 4;

    const up = [-1, 0];
    const down = [1, 0];
    const left = [0, -1];
    const right = [0, 1];

    let ValueBoard = [];

    for (i = 0; i < TableRows; i++) {
      ValueBoard.push([]);
      for (j = 0; j < TableCols; j++) {
        ValueBoard[i].push(bg);
      }
    }

    let PlayingEmbed = new discord.MessageEmbed().setColor("RANDOM");

    function render() {
      //⬛
      PlayingEmbed.setDescription("");
      for (i = 0; i < TableRows; i++) {
        function RowFill() {
          for (j = 0; j < TableCols; j++) {
            if (ValueBoard[i][j] === bg) {
              PlayingEmbed.setDescription(`${PlayingEmbed.description}⬛⬛`);
            } else if (ValueBoard[i][j] === Block2.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block2.color}${Block2.color}`
              );
            } else if (ValueBoard[i][j] === Block4.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block4.color}${Block4.color}`
              );
            } else if (ValueBoard[i][j] === Block8.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block8.color}${Block8.color}`
              );
            } else if (ValueBoard[i][j] === Block16.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block16.color}${Block16.color}`
              );
            } else if (ValueBoard[i][j] === Block32.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block32.color}${Block32.color}`
              );
            } else if (ValueBoard[i][j] === Block64.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block64.color}${Block64.color}`
              );
            } else if (ValueBoard[i][j] === Block128.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block128.color}${Block128.color}`
              );
            } else if (ValueBoard[i][j] === Block256.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block256.color}${Block256.color}`
              );
            } else if (ValueBoard[i][j] === Block512.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block512.color}${Block512.color}`
              );
            } else if (ValueBoard[i][j] === Block1024.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block1024.color}${Block1024.color}`
              );
            } else if (ValueBoard[i][j] === Block2048.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Block2048.color}${Block2048.color}`
              );
            }

            if (j < TableCols - 1) {
              PlayingEmbed.setDescription(`${PlayingEmbed.description}⬛`);
            }
          }
          PlayingEmbed.setDescription(`${PlayingEmbed.description}\n`);
        }
        RowFill();
        RowFill();

        if (i < TableRows - 1) {
          for (x = 0; x < TableCols * 2 + TableCols - 1; x++) {
            PlayingEmbed.setDescription(`${PlayingEmbed.description}⬛`);
          }
          PlayingEmbed.setDescription(`${PlayingEmbed.description}\n`);
        }
      }
    }
    PosCalc(0, 4);
    PosCalc(0, 4);
    render();
    let MapMsg = await msg.channel.send(PlayingEmbed);
    let Alert = await msg.channel.send(
      "Please allow 5 seconds for bot to start"
    );
    msg.react("⬅️");
    msg.react("➡️");
    msg.react("⬆️");
    msg.react("⬇️");
    msg.react("⏹️");

    function DestroyMsg() {
      setTimeout(function () {
        Alert.delete();
      }, 2000);
    }
    setTimeout(function () {
      Alert.edit("You can start");
      DestroyMsg();
      return Gameplay();
    }, 5000);

    function Move(direction) {
      if (direction === up) {
        let Repetition;
        if (TableCols > TableRows) {
          Repetition = TableCols;
        } else {
          Repetition = TableRows;
        }
        //
        //
        for (let Rep = 0; Rep < Repetition; Rep++) {
          for (i = 1; i < TableRows; i++) {
            for (j = 0; j < TableCols; j++) {
              let TempNum = ValueBoard[i][j];
              let TempRow = i + direction[0];
              if (ValueBoard[TempRow][j] != bg) {
                if (ValueBoard[TempRow][j] === TempNum) {
                  ValueBoard[i][j] = bg;
                  TempNum = TempNum + 1;
                } else {
                  TempRow = TempRow - direction[0];
                }
              } else {
                ValueBoard[i][j] = bg;
              }
              ValueBoard[TempRow][j] = TempNum;
            }
          }
        }
        //
        //
      } else if (direction === down) {
        let Repetition;
        if (TableCols > TableRows) {
          Repetition = TableCols;
        } else {
          Repetition = TableRows;
        }
        for (let Rep = 0; Rep < Repetition; Rep++) {
          for (i = TableRows - 2; i >= 0; i = i - 1) {
            for (j = 0; j < TableCols; j++) {
              let TempNum = ValueBoard[i][j];
              let TempRow = i + direction[0];
              if (ValueBoard[TempRow][j] != bg) {
                if (ValueBoard[TempRow][j] === TempNum) {
                  ValueBoard[i][j] = bg;
                  TempNum = TempNum + 1;
                } else {
                  TempRow = TempRow - direction[0];
                }
              } else {
                ValueBoard[i][j] = bg;
              }
              ValueBoard[TempRow][j] = TempNum;
            }
          }
        }
      } else if (direction === left) {
        let Repetition;
        if (TableCols > TableRows) {
          Repetition = TableCols;
        } else {
          Repetition = TableRows;
        }
        for (let Rep = 0; Rep < Repetition; Rep++) {
          for (i = 1; i < TableCols; i++) {
            for (j = 0; j < TableRows; j++) {
              let TempNum = ValueBoard[j][i];
              let TempCol = i + direction[1];
              if (ValueBoard[j][TempCol] != bg) {
                if (ValueBoard[j][TempCol] === TempNum) {
                  ValueBoard[j][i] = bg;
                  TempNum = TempNum + 1;
                } else {
                  TempCol = TempCol - direction[1];
                }
              } else {
                ValueBoard[j][i] = bg;
              }
              ValueBoard[j][TempCol] = TempNum;
            }
          }
        }
      } else if (direction === right) {
        let Repetition;
        if (TableCols > TableRows) {
          Repetition = TableCols;
        } else {
          Repetition = TableRows;
        }
        for (let Rep = 0; Rep < Repetition; Rep++) {
          for (i = TableCols - 2; i >= 0; i = i - 1) {
            for (j = 0; j < TableRows; j++) {
              let TempNum = ValueBoard[j][i];
              let TempCol = i + direction[1];
              if (ValueBoard[j][TempCol] != bg) {
                if (ValueBoard[j][TempCol] === TempNum) {
                  ValueBoard[j][i] = bg;
                  TempNum = TempNum + 1;
                } else {
                  TempCol = TempCol - direction[1];
                }
              } else {
                ValueBoard[j][i] = bg;
              }
              ValueBoard[j][TempCol] = TempNum;
            }
          }
        }
      }
    }
    function PosCalc(min, max) {
      let Reps = 0;
      for (i = 0; i < 1; ) {
        let Temp1 = Math.floor(Math.random() * (max - min)) + min;
        let Temp2 = Math.floor(Math.random() * (max - min)) + min;

        if (ValueBoard[Temp1][Temp2] === bg) {
          let Chance = Math.random();

          if (Chance < 0.9) {
            ValueBoard[Temp1][Temp2] = Block2.number;
          } else {
            ValueBoard[Temp1][Temp2] = Block4.number;
          }
          i++;
        }
        Reps++;
        if (Reps > 16) {
          msg.channel.send("You loose");
          return;
        }
      }
    }
    let MaxValue = -1;
    let CalcedValue;
    let RealEnd = true;
    function Gameplay() {
      RealEnd = true;
      for (i = 0; i < TableRows; i++) {
        for (j = 0; j < TableCols; j++) {
          let TempValue = ValueBoard[i][j];
          if (TempValue < 11) {
            if (TempValue > MaxValue) {
              MaxValue = TempValue;
              CalcedValue = 2;
              for (BinCalc = 0; BinCalc < TempValue; BinCalc++) {
                CalcedValue = CalcedValue * 2;
              }
            }
          }
        }
      }
      PlayingEmbed.setTitle(`Highest value: ${CalcedValue}`);
      MapMsg.edit(PlayingEmbed);
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
        if (react.emoji.name === "⬆️") {
          Move(up);
          PosCalc(0, 4);

          render();
          MapMsg.edit(PlayingEmbed);

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
          RealEnd = false;
          ReactionCollector.stop();
          return Gameplay();
        } else if (react.emoji.name === "⬇️") {
          Move(down);
          PosCalc(0, 4);

          render();
          MapMsg.edit(PlayingEmbed);

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

          RealEnd = false;
          ReactionCollector.stop();
          return Gameplay();
        } else if (react.emoji.name === "➡️") {
          Move(right);
          PosCalc(0, 4);

          render();
          MapMsg.edit(PlayingEmbed);

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

          RealEnd = false;
          ReactionCollector.stop();
          return Gameplay();
        } else if (react.emoji.name === "⬅️") {
          Move(left);
          PosCalc(0, 4);

          render();
          MapMsg.edit(PlayingEmbed);

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

          RealEnd = false;
          ReactionCollector.stop();
          return Gameplay();
        } else if (react.emoji.name === "⏹️") {
          msg.channel.send("Stopped!");

          RealEnd = false;
          ReactionCollector.stop();
          return;
        }
      });
      ReactionCollector.on("end", () => {
        if (RealEnd === true) {
          PlayingEmbed.setTitle(`Time expired: highest score: ${CalcedValue}`);
          MapMsg.edit(PlayingEmbed);
          return;
        }
      });
    }
  }
};

module.exports.help = {
  name: "2048",
};
