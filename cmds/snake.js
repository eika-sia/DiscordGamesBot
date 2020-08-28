const Discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, userId) => {
  /**
   * ? 1. Generate a grid, Sokobans generation should work - done
   * ? 2. Generate a starting position for food and for snake, Sokobans generation should work - done
   * ? 3. Make snake move, intervals could work good - done
   * ? 4. Make Snake an array of positions (better if we do it from the start) - done
   * ? 5. Make snake expandable, for loop that applies same +-x +-y - done
   * ? 6. Make a help file - done
   * *For expansion apply movement*(-1) to last part
   */
  let prefix = "";
  let argsF = new Array();
  argsF = args;

  //*Movement changes [rowChange, colChange]
  const up = [-1, 0];
  const down = [1, 0];
  const left = [0, -1];
  const right = [0, 1];
  db.collection("guilds")
    .doc(msg.guild.id)
    .get()
    .then((q) => {
      if (q.exists) {
        prefix = q.data().prefix;
      }
    })
    .then(() => {
      if (argsF.length === 0) {
        const snakeHelp = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("A game of snake!")
          .setDescription("Come on, everyone knows how to play snake")
          .addFields(
            {
              name: `${prefix}snake start`,
              value: "Start the game",
            },
            {
              name: "w, a, s, d",
              value: "move the snake",
            },
            {
              name: "stop",
              value: "Stop the game (you can also win to stop it)",
            },
            {
              name: "How to play?",
              value:
                "Enter w, a, s, d (standard controls) to move the charater over the map grid and push boxes! Write stop to stop the game",
            },
            {
              name: `${prefix}snake top`,
              value: "Returns top 3 players of snake",
            }
          );
        msg.channel.send(snakeHelp);
      }
    });
  if (argsF[0] === "start") {
    //*Player adding from firebase
    let players = new Array(),
      applesTop = new Array(),
      userNames = new Array();
    db.collection("snake")
      .doc(msg.guild.id)
      .get()
      .then((q) => {
        if (q.exists) {
          players = q.data().players;
          applesTop = q.data().applesTop;
          userNames = q.data().userNames;
        }
      })
      .then(() => {
        if (!players.includes(msg.author.id)) {
          console.log("adding new user! " + msg.author.id);
          //Add
          players.push(msg.author.id);
          applesTop.push(0);
          userNames.push(msg.author.username);
          db.collection("snake").doc(msg.guild.id).update({
            players: players,
            applesTop: applesTop,
            userNames: userNames,
          });
        }
      });

    // ? Task 1, 2 --- Map generation --- Will try to implement movement array - Task 4

    //* Constants for charaters in the game matrix
    const wall = 1; //* ":yellow_square:"
    const bg = 0; //* ":large_black_square:"
    const snakeHead = 2; //* ":snake:"
    const snakeBody = 3; //* ":green_circle:"
    const apple = 4; //* ":apple:"

    //! Positions will be in (y, x) format so it's easier for rendering
    let SnakePosArray = [];
    //*Making it an array [y,x] - Improvement learned from Sokoban
    let ApplePosArray = [];
    let TableRows = 9;
    let TableCols = 11;
    let PlayingField = new Array();
    let PlayingEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription("")
      .setTitle("Eaten apples: 0");

    for (i = 0; i < TableRows; i++) {
      PlayingField.push([]);
    }
    //* The function that Will generate the map
    function MapGen() {
      function FullWall(Row) {
        for (i = 0; i < TableCols; i++) {
          PlayingField[Row][i] = wall;
        }
      }
      function MidBg() {
        for (i = 0; i < TableRows; i++) {
          for (j = 0; j < TableCols; j++) {
            PlayingField[i][j] = bg;
          }
          PlayingField[i][0] = wall;
          PlayingField[i][TableCols - 1] = wall;
        }
      }
      MidBg();
      FullWall(0);
      FullWall(TableRows - 1);

      //*Spawning Snake and apple
      for (i = 0; i < 1; ) {
        let TempRow = RandomPos(1, TableRows - 1);
        let TempCol = RandomPos(1, TableCols - 1);
        if (PlayingField[TempRow][TempCol] === 0) {
          PlayingField[TempRow][TempCol] = snakeHead;
          SnakePosArray.push([TempRow, TempCol]);

          i++;
        }
      }

      for (i = 0; i < 1; ) {
        let TempRow = RandomPos(1, TableRows - 1);
        let TempCol = RandomPos(1, TableCols - 1);
        if (PlayingField[TempRow][TempCol] === 0) {
          PlayingField[TempRow][TempCol] = apple;
          ApplePosArray = [TempRow, TempCol];
          i++;
        }
      }
    }

    function RandomPos(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function render() {
      PlayingEmbed.setDescription("");
      for (i = 0; i < TableRows; i++) {
        for (j = 0; j < TableCols; j++) {
          if (PlayingField[i][j] === 0) {
            PlayingEmbed.setDescription(
              `${PlayingEmbed.description}:black_large_square:`
            );
          } else if (PlayingField[i][j] === 1) {
            PlayingEmbed.setDescription(
              `${PlayingEmbed.description}:yellow_square:`
            );
          } else if (PlayingField[i][j] === 2) {
            PlayingEmbed.setDescription(`${PlayingEmbed.description}:snake:`);
          } else if (PlayingField[i][j] === 3) {
            PlayingEmbed.setDescription(
              `${PlayingEmbed.description}:green_circle:`
            );
          } else if (PlayingField[i][j] === 4) {
            PlayingEmbed.setDescription(`${PlayingEmbed.description}:apple:`);
          }
        }
        PlayingEmbed.setDescription(`${PlayingEmbed.description}\n`);
      }
    }

    let MapMsg, Alert;
    async function Draw1st() {
      MapMsg = await msg.channel.send(PlayingEmbed);
      Alert = await msg.channel.send(
        "Please wait for 5 seconds before starting inputs"
      );
      msg.react("⬅️");
      msg.react("➡️");
      msg.react("⬆️");
      msg.react("⬇️");
      msg.react("⏹️");
    }

    function DestroyMsg() {
      setTimeout(function () {
        Alert.delete();
      }, 2000);
    }

    //*Starting the game
    MapGen();
    render();
    Draw1st().catch((err) => {});
    setTimeout(function () {
      Alert.edit("You can start now!");
      DestroyMsg();
      Gameplay();
    }, 5000);

    let EatedNow = false;

    async function snakeMove(direction) {
      let TempRow = SnakePosArray[0][0];
      let TempCol = SnakePosArray[0][1];

      let StorageRow = TempRow;
      let StorageCol = TempCol;

      PlayingField[TempRow][TempCol] = bg;
      TempRow = TempRow + direction[0];
      TempCol = TempCol + direction[1];

      PlayingField[TempRow][TempCol] = snakeHead;
      SnakePosArray[0] = [TempRow, TempCol];
      if (SnakePosArray.length > 1) {
        for (let i = 1; i < SnakePosArray.length; i++) {
          let TempRow = SnakePosArray[i][0];
          let TempCol = SnakePosArray[i][1];

          let StorageRow1 = TempRow;
          let StorageCol1 = TempCol;

          PlayingField[TempRow][TempCol] = bg;
          TempRow = StorageRow;
          TempCol = StorageCol;

          StorageRow = StorageRow1;
          StorageCol = StorageCol1;

          PlayingField[TempRow][TempCol] = snakeBody;
          SnakePosArray[i] = [TempRow, TempCol];
        }
      }
      if (EatedNow === true) {
        PlayingField[StorageRow][StorageCol] = snakeBody;
        SnakePosArray.push([StorageRow, StorageCol]);
        EatedNow = false;
      }
    }

    let Direction = "";
    //*Main loop of the game
    let AppleCounter = 0;
    let Lost = false;
    function Gameplay() {
      let RealEnd = true;
      const Wordfilter = (m) => m.author.id === msg.author.id;
      const Reactionfilter = (reaction, user) => {
        let tempUser = String(user);
        tempUser = tempUser.slice(0, tempUser.length - 1);
        tempUser = tempUser.slice(1);
        tempUser = tempUser.slice(1);
        if (tempUser === userId) {
          return true;
        }
      };

      const WordCollector = msg.channel.createMessageCollector(Wordfilter, {
        time: 2000,
      });

      const ReactionCollector = msg.createReactionCollector(Reactionfilter, {
        time: 2000,
      });

      //? Checks for diff stuff (Winning - apple collections, loosing - hitting the wall - eating yourself {make something fun like bit off insted of loose}) -done
      let AppleRows = ApplePosArray[0];
      let AppleCols = ApplePosArray[1];
      let SnakeRows = SnakePosArray[0][0];
      let SnakeCols = SnakePosArray[0][1];
      //*Apple colison detection
      if (AppleCols === SnakeCols) {
        if (AppleRows === SnakeRows) {
          for (i = 0; i < 1; ) {
            let TempRow = RandomPos(1, TableRows - 1);
            let TempCol = RandomPos(1, TableCols - 1);
            if (PlayingField[TempRow][TempCol] === 0) {
              PlayingField[TempRow][TempCol] = apple;
              ApplePosArray = [TempRow, TempCol];
              i++;
            }
          }

          //? add the snake add a part on the back - done

          EatedNow = true;

          render();
          AppleCounter++;
          PlayingEmbed.setTitle(`Eaten apples: ${AppleCounter}`);
          MapMsg.edit(PlayingEmbed);

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();
          return Gameplay();
        }
      }
      //TODO Fixing the fact that you can go through walls
      for (i = 0; i < SnakePosArray.length; i++) {
        let TempRow = SnakePosArray[i][0];
        let TempCol = SnakePosArray[i][1];

        if (
          TempRow === 0 ||
          TempRow === TableRows - 1 ||
          TempCol === 0 ||
          TempCol === TableCols - 1
        ) {
          PlayingEmbed.setTitle("You loose!");

          db.collection("snake")
            .doc(msg.guild.id)
            .get()
            .then((q) => {
              if (q.exists) {
                players = q.data().players;
                applesTop = q.data().applesTop;
                userNames = q.data().userNames;
              }
            });
          if (applesTop[players.indexOf(msg.author.id)] < AppleCounter) {
            applesTop[players.indexOf(msg.author.id)] = AppleCounter;
            db.collection("snake").doc(msg.guild.id).update({
              applesTop: applesTop,
            });
          }

          RealEnd = false;
          Lost = true;
          WordCollector.stop();
          ReactionCollector.stop();

          return MapMsg.edit(PlayingEmbed);
        }
      }
      if (SnakePosArray.length > 3) {
        for (i = 1; i < SnakePosArray.length; i++) {
          let HeadRow = SnakePosArray[0][0];
          let HeadCol = SnakePosArray[0][1];

          let TempRow = SnakePosArray[i][0];
          let TempCol = SnakePosArray[i][1];

          if (HeadRow === TempRow) {
            if (HeadCol === TempCol) {
              PlayingEmbed.setTitle("You loose!");

              db.collection("snake")
                .doc(msg.guild.id)
                .get()
                .then((q) => {
                  if (q.exists) {
                    players = q.data().players;
                    applesTop = q.data().applesTop;
                    userNames = q.data().userNames;
                  }
                });
              if (applesTop[players.indexOf(msg.author.id)] < AppleCounter) {
                applesTop[players.indexOf(msg.author.id)] = AppleCounter;
                db.collection("snake").doc(msg.guild.id).update({
                  applesTop: applesTop,
                });
              }

              RealEnd = false;
              Lost = true;
              WordCollector.stop();
              ReactionCollector.stop();

              return MapMsg.edit(PlayingEmbed);
            }
          }
        }
      }

      WordCollector.on("collect", (m) => {
        if (m.content === "stop") {
          db.collection("snake")
            .doc(msg.guild.id)
            .get()
            .then((q) => {
              if (q.exists) {
                players = q.data().players;
                applesTop = q.data().applesTop;
                userNames = q.data().userNames;
              }
            });
          if (applesTop[players.indexOf(msg.author.id)] < AppleCounter) {
            applesTop[players.indexOf(msg.author.id)] = AppleCounter;
            db.collection("snake").doc(msg.guild.id).update({
              applesTop: applesTop,
            });
          }
          Lost = true;
          return msg.channel.send("Stopped!");
        } else if (m.content === "w") {
          snakeMove(up);

          render();
          MapMsg.edit(PlayingEmbed);
          msg.channel.bulkDelete(1, true);
          Direction = "w";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (m.content === "s") {
          snakeMove(down);

          render();
          MapMsg.edit(PlayingEmbed);
          msg.channel.bulkDelete(1, true);
          Direction = "s";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (m.content === "a") {
          snakeMove(left);

          render();
          MapMsg.edit(PlayingEmbed);
          msg.channel.bulkDelete(1, true);
          Direction = "a";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (m.content === "d") {
          snakeMove(right);

          render();
          MapMsg.edit(PlayingEmbed);
          msg.channel.bulkDelete(1, true);
          Direction = "d";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        }
      });
      //*Temporay end
      WordCollector.on("end", () => {
        if (Lost === true) {
        } else if (RealEnd === true) {
          if (Direction === "w") {
            snakeMove(up).catch((err) => {
              console.log(err);
            });

            render();
            MapMsg.edit(PlayingEmbed);

            return Gameplay();
          } else if (Direction === "s") {
            snakeMove(down).catch((err) => {
              console.log(err);
            });

            render();
            MapMsg.edit(PlayingEmbed);

            return Gameplay();
          } else if (Direction === "a") {
            snakeMove(left).catch((err) => {
              console.log(err);
            });

            render();
            MapMsg.edit(PlayingEmbed);

            return Gameplay();
          } else if (Direction === "d") {
            snakeMove(right).catch((err) => {
              console.log(err);
            });

            render();
            MapMsg.edit(PlayingEmbed);

            return Gameplay();
          } else if (Direction === "") {
            snakeMove(right).catch((err) => {
              console.log(err);
            });

            render();
            MapMsg.edit(PlayingEmbed);

            return Gameplay();
          }
        } else {
        }
      });

      //TODO Make reactions work!
      ReactionCollector.on("collect", (reaction, user) => {
        if (reaction.emoji.name === "⬆️") {
          snakeMove(up);

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
          Direction = "w";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (reaction.emoji.name === "⬇️") {
          snakeMove(down);

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
          Direction = "s";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (reaction.emoji.name === "➡️") {
          snakeMove(right);

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
          Direction = "d";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (reaction.emoji.name === "⬅️") {
          snakeMove(left);

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
          Direction = "a";

          RealEnd = false;
          WordCollector.stop();
          ReactionCollector.stop();

          return Gameplay();
        } else if (reaction.emoji.name === "⏹️") {
          db.collection("snake")
            .doc(msg.guild.id)
            .get()
            .then((q) => {
              if (q.exists) {
                players = q.data().players;
                applesTop = q.data().applesTop;
                userNames = q.data().userNames;
              }
            });
          if (applesTop[players.indexOf(msg.author.id)] < AppleCounter) {
            applesTop[players.indexOf(msg.author.id)] = AppleCounter;
            db.collection("snake").doc(msg.guild.id).update({
              applesTop: applesTop,
            });
          }
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
          Lost = true;
          return msg.channel.send("Stopped!");
        }
      });
    }
  } else if (args[0] === "top") {
    let players = new Array(),
      applesTop = new Array(),
      userNames = new Array();
    db.collection("snake")
      .doc(msg.guild.id)
      .get()
      .then((q) => {
        if (q.exists) {
          players = q.data().players;
          applesTop = q.data().applesTop;
          userNames = q.data().userNames;
        } else {
          db.collection("snake")
            .doc(msg.guild.id)
            .set({
              players: [],
              applesTop: [],
              userNames: [],
            })
            .then(() => {
              msg.channel.send("No players logged - Play the game first");
              return;
            });
        }
      })
      .then(() => {
        for (let i = 0; i < players.length; i++) {
          for (let j = 0; j < players.length; j++) {
            if (applesTop[j] < applesTop[j + 1]) {
              let tmp = applesTop[j];
              let tmp2 = userNames[j];
              userNames[j] = userNames[j + 1];
              applesTop[j] = applesTop[j + 1];
              applesTop[j + 1] = tmp;
              userNames[j + 1] = tmp2;
            }
          }
        }
      })
      .then(() => {
        const TopApples = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .addFields([
            {
              name: `${userNames[0]}:`,
              value: `${applesTop[0]}`,
            },
            {
              name: `${userNames[1]}:`,
              value: `${applesTop[1]}`,
            },
            {
              name: `${userNames[2]}:`,
              value: `${applesTop[2]}`,
            },
          ])
          .setTitle("Top apples!");
        msg.channel.send(TopApples);
      });
  }
};

module.exports.help = {
  name: "snake",
};
