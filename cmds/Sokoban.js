const { path } = require("dotenv/lib/env-options");
const Discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, userId) => {
  //help card for the game\
  let argsF = new Array();
  argsF = args;
  if (argsF.length === 0) {
    let prefix;
    db.collection("guilds")
      .doc(msg.guild.id)
      .get()
      .then((q) => {
        if (q.exists) {
          prefix = q.data().prefix;
        }
      })
      .then(() => {
        const SokobanHelp = new Discord.MessageEmbed()
          .setTitle("Sokoban!")
          .setDescription("You need to push boxes in designated areas!")
          .addFields(
            {
              name: `${prefix}Sokoban start`,
              value: "Start the game",
            },
            {
              name: "w, a, s, d",
              value: "move the player",
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
              name: "What are all the blocks?",
              value:
                ":purple_square: - wall, :regional_indicator_o: - movable block, \n ❎ - Your target, 😀 - You!",
            },
            {
              name: `${prefix}Sokoban top`,
              value: "Returns top 3 players of sokoban",
            }
          )
          .setColor("RANDOM");
        //Sending the first msgs
        msg.channel.send("Doing math in background for optimal gameplay");
        msg.channel
          .send(SokobanHelp)
          .then((r) => r.delete(10000))
          .catch((err) => {});
      });
  }
  if (args[0] === "top") {
    let playerNames = new Array(),
      wins = new Array(),
      totalGames = new Array();
    db.collection("sokoban")
      .doc(msg.guild.id)
      .get()
      .then((q) => {
        if (q.exists) {
          playerNames = q.data().playerNames;
          wins = q.data().wins;
          totalGames = q.data().totalGames;
        }
      })
      .then(() => {
        let WGratio = new Array();
        for (i = 0; i < wins.length; i++) {
          WGratio.push((wins[i] / totalGames[i]).toFixed(2));
        }
        let playerNames2 = playerNames.map((x) => x.slice());
        for (let i = 0; i < wins.length; i++) {
          for (let j = 0; j < wins.length; j++) {
            if (wins[j] < wins[j + 1]) {
              let tmp = wins[j];
              let tmp2 = playerNames[j];
              wins[j] = wins[j + 1];
              playerNames[j] = playerNames[j + 1];
              wins[j + 1] = tmp;
              playerNames[j + 1] = tmp2;
            }
          }
        }
        const TopWins = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .addFields([
            {
              name: `${playerNames[0]}:`,
              value: `${wins[0]}`,
            },
            {
              name: `${playerNames[1]}:`,
              value: `${wins[1]}`,
            },
            {
              name: `${playerNames[2]}:`,
              value: `${wins[2]}`,
            },
          ])
          .setTitle("Top wins!");

        for (let i = 0; i < WGratio.length; i++) {
          for (let j = 0; j < WGratio.length; j++) {
            if (WGratio[j] < WGratio[j + 1]) {
              let tmp = WGratio[j];
              let tmp2 = playerNames2[j];
              WGratio[j] = WGratio[j + 1];
              playerNames2[j] = playerNames2[j + 1];
              WGratio[j + 1] = tmp;
              playerNames2[j + 1] = tmp2;
            }
          }
        }
        const TopWgRatio = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .addFields([
            {
              name: `${playerNames2[0]}:`,
              value: `${WGratio[0]}`,
            },
            {
              name: `${playerNames2[1]}:`,
              value: `${WGratio[1]}`,
            },
            {
              name: `${playerNames2[2]}:`,
              value: `${WGratio[2]}`,
            },
          ])
          .setTitle("Top win/game ratio!");
        msg.channel.send(TopWins);
        msg.channel.send(TopWgRatio);
      });
  } else {
    let players = new Array(),
      wins = new Array(),
      playerNames = new Array();
    let totalGames = new Array();
    db.collection("sokoban")
      .doc(msg.guild.id)
      .get()
      .then((q) => {
        //Getting variables from Firebase
        if (q.exists) {
          players = q.data().players;
          wins = q.data().wins;
          playerNames = q.data().playerNames;
          totalGames = q.data().totalGames;
        }
      })
      .then(() => {
        let Game = false;
        if (args[0] === "start") {
          msg.channel.send("Sokoban is starting up!");
          Game = true;
        }

        //Defining some wars for later
        let MapMsg;
        let Alert;
        let PlayerColPos;
        let PlayerRowPos;
        let BlockColPos;
        let BlockRowPos;
        let TargetColPos;
        let TargetRowPos;
        let DeathRow = new Array();
        let DeathCol = new Array();
        let EvilColPos;
        let EvilRowPos;
        let EvilAlive;
        const up = [-1, 0];
        const down = [1, 0];
        const left = [0, -1];
        const right = [0, 1];

        let grid = new Array();

        let Map = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setDescription("");

        if (Game === true) {
          //Adding players to the games save
          if (!players.includes(msg.author.id)) {
            console.log("adding new user! " + msg.author.id);
            //Add
            players.push(msg.author.id);
            wins.push(0);
            playerNames.push(msg.author.username);
            totalGames.push(0);
            db.collection("sokoban").doc(msg.guild.id).update({
              players: players,
              wins: wins,
              playerNames: playerNames,
              totalGames: totalGames,
            });
          }
          let i;

          //Filling in the array for an empty map
          var MapArrayC = [[], [], [], [], [], [], [], [], []];

          function MapGen() {
            //Basic static map

            //Variables for blocks
            const player = 1;
            const wall = 5;
            const block = 2;
            const Target = 3;
            const Bg = 0;
            const DeathBlock = 4;
            const rage = 6;

            //Setting up the map

            //Functions so it's easier to read
            function FullWall(Row) {
              for (i = 0; i < 13; i++) {
                MapArrayC[Row][i] = wall;
              }
            }
            let j;

            function MidBg() {
              for (j = 1; j < 9; j++) {
                for (i = 0; i < 11; i++) {
                  MapArrayC[j][0] = wall;
                  MapArrayC[j][i + 1] = Bg;
                  MapArrayC[j][11] = wall;
                }
              }
            }
            //Calling the functions
            FullWall(0);
            MidBg();
            FullWall(8);

            //Adding special objects
            let TempRow = 0,
              TempCol = 0;

            //General random position
            function ColPos(min, max) {
              return Math.floor(Math.random() * (max - min)) + min;
            }

            function RowPos(min, max) {
              return Math.floor(Math.random() * (max - min)) + min;
            }

            //block
            for (i = 0; i < 1; ) {
              BlockColPos = ColPos(3, 7);
              BlockRowPos = RowPos(2, 6);
              if (MapArrayC[BlockRowPos][BlockColPos] === 0) {
                MapArrayC[BlockRowPos][BlockColPos] = block;
                MapArrayC[BlockRowPos + 1][BlockColPos] = block;
                MapArrayC[BlockRowPos - 1][BlockColPos] = block;
                MapArrayC[BlockRowPos][BlockColPos + 1] = block;
                MapArrayC[BlockRowPos][BlockColPos - 1] = block;
                i++;
              }
            }

            //player
            for (i = 0; i < 1; ) {
              PlayerColPos = ColPos(2, 8);
              PlayerRowPos = RowPos(2, 6);
              if (MapArrayC[PlayerRowPos][PlayerColPos] === 0) {
                MapArrayC[PlayerRowPos][PlayerColPos] = player;
                i++;
              }
            }

            //Target
            for (i = 0; i < 1; ) {
              TargetColPos = ColPos(2, 8);
              TargetRowPos = RowPos(2, 6);
              if (MapArrayC[TargetRowPos][TargetColPos] === 0) {
                MapArrayC[TargetRowPos][TargetColPos] = Target;
                i++;
              }
            }

            //Evil boi spawning
            for (i = 0; i < 1; ) {
              EvilColPos = ColPos(1, 9);
              EvilRowPos = RowPos(1, 7);
              if (MapArrayC[EvilRowPos][EvilColPos] === 0) {
                if (EvilRowPos === 1 || EvilRowPos === 7) {
                  MapArrayC[EvilRowPos][EvilColPos] = 6;
                  i++;
                }
                if (EvilColPos === 1 || EvilColPos === 9) {
                  MapArrayC[EvilRowPos][EvilColPos] = 6;
                  i++;
                }
              }
            }

            for (i = 0; i < 3; ) {
              DeathCol[i] = ColPos(1, 9);
              DeathRow[i] = RowPos(1, 7);
              if (MapArrayC[DeathRow[i]][DeathCol[i]] === 0) {
                MapArrayC[DeathRow[i]][DeathCol[i]] = 4;
                i++;
              }
            }

            MapArrayC[BlockRowPos + 1][BlockColPos] = 0;
            MapArrayC[BlockRowPos - 1][BlockColPos] = 0;
            MapArrayC[BlockRowPos][BlockColPos + 1] = 0;
            MapArrayC[BlockRowPos][BlockColPos - 1] = 0;
            FillMap(MapArrayC);
          }

          function FillMap(array) {
            Map.setDescription("");
            for (i = 0; i < 9; i++) {
              for (j = 0; j < 11; j = j + 2) {
                if (array[i][j] === 0) {
                  Map.setDescription(`${Map.description}:black_large_square:`);
                } else if (array[i][j] === 5) {
                  Map.setDescription(`${Map.description}:purple_square:`);
                } else if (array[i][j] === 4) {
                  Map.setDescription(`${Map.description}:x:`);
                } else if (array[i][j] === 1) {
                  Map.setDescription(`${Map.description}:grinning:`);
                } else if (array[i][j] === 2) {
                  Map.setDescription(
                    `${Map.description}:regional_indicator_o:`
                  );
                } else if (array[i][j] === 3) {
                  Map.setDescription(`${Map.description}❎`);
                } else if (array[i][j] === 6) {
                  Map.setDescription(`${Map.description}:rage:`);
                }

                if (array[i][j + 1] === 0) {
                  Map.setDescription(`${Map.description}:black_large_square:`);
                } else if (array[i][j + 1] === 5) {
                  Map.setDescription(`${Map.description}:purple_square:`);
                } else if (array[i][j + 1] === 4) {
                  Map.setDescription(`${Map.description}:x:`);
                } else if (array[i][j + 1] === 1) {
                  Map.setDescription(`${Map.description}:grinning:`);
                } else if (array[i][j + 1] === 2) {
                  Map.setDescription(
                    `${Map.description}:regional_indicator_o:`
                  );
                } else if (array[i][j + 1] === 3) {
                  Map.setDescription(`${Map.description}❎`);
                } else if (array[i][j + 1] === 6) {
                  Map.setDescription(`${Map.description}:rage:`);
                }
              }
              Map.setDescription(`${Map.description}\n`);
            }
          }
          async function MapDraw() {
            //msg.channel.send(Map);
            Alert = await msg.channel.send(
              "Please give the bot 5 seconds to prepare"
            );
            EvilAlive = true;
            MapMsg = await msg.channel.send(Map);
          }
          MapGen();
          MapDraw().then(() => {
            msg.react("⬅️");
            msg.react("➡️");
            msg.react("⬆️");
            msg.react("⬇️");
            msg.react("⏹️");
          });

          function DestroyMsg() {
            setTimeout(function () {
              Alert.delete();
            }, 2000);
          }
          setTimeout(function () {
            Alert.edit("You can start now!");
            DestroyMsg();
            return GamePlay();
          }, 5000);
        }
        //This function will be looped untill the end of the game

        //Evil bot pathfinding
        async function pathfinding() {
          var Matrix = new Array();
          Matrix = MapArrayC.map((x) => x.slice());
          const astar = require("../node_modules/javascript-astar/astar");
          var graph = new astar.Graph(Matrix);
          var start = graph.grid[EvilRowPos][EvilColPos];
          var end = graph.grid[PlayerRowPos][PlayerColPos];
          var result = astar.astar.search(graph, start, end);
          MapArrayC[EvilRowPos][EvilColPos] = 0;
          EvilRowPos = result[0].x;
          EvilColPos = result[0].y;

          MapArrayC[EvilRowPos][EvilColPos] = 6;
        }
        let Lost = false;

        function Move(direction) {
          MapArrayC[PlayerRowPos][PlayerColPos] = 0;
          PlayerRowPos = PlayerRowPos + direction[0];
          PlayerColPos = PlayerColPos + direction[1];

          //Checks for walls
          if (MapArrayC[PlayerRowPos][PlayerColPos] === 5) {
            PlayerRowPos = PlayerRowPos - direction[0];
            PlayerColPos = PlayerColPos - direction[1];
          }
          //cehcks for target area
          if (MapArrayC[PlayerRowPos][PlayerColPos] === 3) {
            PlayerRowPos = PlayerRowPos - direction[0];
            PlayerColPos = PlayerColPos - direction[1];
          }

          //Checks for the movable block
          if (PlayerRowPos === BlockRowPos && BlockColPos === PlayerColPos) {
            BlockRowPos = BlockRowPos + direction[0];
            BlockColPos = BlockColPos + direction[1];
            MapArrayC[BlockRowPos][BlockColPos] = 2;
          }
          MapArrayC[PlayerRowPos][PlayerColPos] = 1;
          FillMap(MapArrayC);
          MapMsg.edit(Map);
        }

        function GamePlay() {
          let RealEnd = true;

          const Wordfilter = (m) => {
            return m.author.id === msg.author.id;
          };
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

          const WordCollector = msg.channel.createMessageCollector(Wordfilter, {
            time: 10000,
          });

          const ReactionCollector = msg.createReactionCollector(
            Reactionfilter,
            {
              time: 10000,
            }
          );
          //Checking for winning
          db.collection("sokoban")
            .doc(msg.guild.id)
            .get()
            .then((q) => {
              //Getting variables from Firebase (Firestore)
              if (q.exists) {
                players = q.data().players;
                wins = q.data().wins;
                playerNames = q.data().playerNames;
                totalGames = q.data().totalGames;
              }
            })
            .then(() => {
              if (
                TargetColPos === BlockColPos &&
                BlockRowPos === TargetRowPos
              ) {
                Map.setTitle("You win this level!");
                MapMsg.edit(Map);
                totalGames[players.indexOf(msg.author.id)] += 1;
                wins[players.indexOf(msg.author.id)] += 1;
                db.collection("sokoban").doc(msg.guild.id).update({
                  wins: wins,
                  totalGames: totalGames,
                });
                for (i = 4; i < 8; i++) {
                  MapArrayC[0][i] = 0;
                }
                for (i = 4; i < 8; i++) {
                  MapArrayC[8][i] = 0;
                }
                for (i = 3; i < 6; i++) {
                  MapArrayC[i][0] = 0;
                }
                for (i = 3; i < 6; i++) {
                  MapArrayC[i][11] = 0;
                }
                FillMap(MapArrayC);
                MapMsg.edit(Map);
                EvilAlive = false;
                BlockColPos = "";
                BlockRowPos = "";
              }
              //checking for loosing
              for (i = 0; i < DeathCol.length; i++) {
                if (
                  DeathCol[i] === BlockColPos &&
                  DeathRow[i] === BlockRowPos
                ) {
                  Map.setTitle("You loose!");
                  MapMsg.edit(Map);
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    wins: wins,
                    totalGames: totalGames,
                  });
                  return;
                }
                if (
                  DeathCol[i] === PlayerColPos &&
                  DeathRow[i] === PlayerRowPos
                ) {
                  Map.setTitle("You loose!");
                  MapMsg.edit(Map);
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    wins: wins,
                    totalGames: totalGames,
                  });
                  return;
                }
              }

              //Crushing the evil boi
              if (EvilAlive) {
                if (EvilColPos === BlockColPos && EvilRowPos === BlockRowPos) {
                  Map.setTitle("You win this level!");
                  MapMsg.edit(Map);
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  wins[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    wins: wins,
                    totalGames: totalGames,
                  });
                  for (i = 4; i < 8; i++) {
                    MapArrayC[0][i] = 0;
                  }
                  for (i = 4; i < 8; i++) {
                    MapArrayC[8][i] = 0;
                  }
                  for (i = 3; i < 6; i++) {
                    MapArrayC[i][0] = 0;
                  }
                  for (i = 3; i < 6; i++) {
                    MapArrayC[i][11] = 0;
                  }
                  FillMap(MapArrayC);
                  MapMsg.edit(Map);
                  EvilAlive = false;
                  BlockColPos = "";
                  BlockRowPos = "";
                } else {
                  pathfinding().catch((err) => {
                    Map.setTitle("You loose!");
                    MapMsg.edit(Map);
                    totalGames[players.indexOf(msg.author.id)] += 1;
                    db.collection("sokoban").doc(msg.guild.id).update({
                      wins: wins,
                      totalGames: totalGames,
                    });
                    return;
                  });
                }
              }

              if (EvilColPos === PlayerColPos && EvilRowPos === PlayerRowPos) {
                Map.setTitle("You loose!");
                MapMsg.edit(Map);
                totalGames[players.indexOf(msg.author.id)] += 1;
                db.collection("sokoban").doc(msg.guild.id).update({
                  wins: wins,
                  totalGames: totalGames,
                });
                return;
              }

              let MapArrayP;

              //Checking for map crossing

              if (
                PlayerColPos === 11 &&
                PlayerRowPos > 2 &&
                PlayerRowPos < 7 &&
                EvilAlive === false
              ) {
                Map.setTitle("");
                MapGen();

                RealEnd = false;
                WordCollector.stop();
                ReactionCollector.stop();

                MapMsg.edit(Map);
                EvilAlive = true;

                return GamePlay();
              } else if (
                PlayerRowPos === 0 &&
                PlayerColPos > 3 &&
                PlayerColPos < 9 &&
                EvilAlive === false
              ) {
                Map.setTitle("");
                MapGen();

                RealEnd = false;
                WordCollector.stop();
                ReactionCollector.stop();

                MapMsg.edit(Map);
                EvilAlive = true;

                return GamePlay();
              } else if (
                PlayerRowPos === 8 &&
                PlayerColPos > 3 &&
                PlayerColPos < 9 &&
                EvilAlive === false
              ) {
                Map.setTitle("");
                MapGen();

                RealEnd = false;
                WordCollector.stop();
                ReactionCollector.stop();

                MapMsg.edit(Map);
                EvilAlive = true;

                return GamePlay();
              } else if (
                PlayerColPos === 0 &&
                PlayerRowPos > 2 &&
                PlayerRowPos < 7 &&
                EvilAlive === false
              ) {
                Map.setTitle("");
                MapGen();

                RealEnd = false;
                WordCollector.stop();
                ReactionCollector.stop();

                MapMsg.edit(Map);
                EvilAlive = true;

                return GamePlay();
              }

              //Filter mechanic
              ReactionCollector.on("collect", (react, user) => {
                if (react.emoji.name === "⬆️") {
                  Move(up);

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
                  WordCollector.stop();
                  ReactionCollector.stop();

                  return GamePlay();
                } else if (react.emoji.name === "⬇️") {
                  Move(down);

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
                  WordCollector.stop();
                  ReactionCollector.stop();

                  return GamePlay();
                } else if (react.emoji.name === "⬅️") {
                  Move(left);

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
                  WordCollector.stop();
                  ReactionCollector.stop();

                  return GamePlay();
                } else if (react.emoji.name === "➡️") {
                  Move(right);

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
                  WordCollector.stop();
                  ReactionCollector.stop();

                  return GamePlay();
                } else if (react.emoji.name === "⏹️") {
                  Game = false;
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    wins: wins,
                    totalGames: totalGames,
                  });
                  Lost = true;

                  ReactionCollector.stop();
                  WordCollector.stop();

                  return msg.channel.send("Game stopped!");
                }
              });
              WordCollector.on("collect", (m) => {
                if (m.content === "stop") {
                  Game = false;
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    wins: wins,
                    totalGames: totalGames,
                  });
                  Lost = true;
                  return msg.channel.send("Game stopped!");
                } else if (m.content === "w") {
                  Move(up);

                  RealEnd = false;
                  WordCollector.stop();
                  ReactionCollector.stop();

                  msg.channel.bulkDelete(1, true);

                  return GamePlay();
                } else if (m.content === "a") {
                  Move(left);

                  RealEnd = false;
                  WordCollector.stop();
                  ReactionCollector.stop();

                  msg.channel.bulkDelete(1, true);

                  return GamePlay();
                } else if (m.content === "s") {
                  Move(down);

                  RealEnd = false;
                  WordCollector.stop();
                  ReactionCollector.stop();

                  msg.channel.bulkDelete(1, true);

                  return GamePlay();
                } else if (m.content === "d") {
                  Move(right);

                  RealEnd = false;
                  WordCollector.stop();
                  ReactionCollector.stop();

                  msg.channel.bulkDelete(1, true);

                  return GamePlay();
                } else {
                  msg.channel.bulkDelete(1, true);
                  return GamePlay();
                }
              });
              WordCollector.on("end", () => {
                if (Lost === true) {
                } else if (RealEnd === true) {
                  Map.setTitle("Time expired!");
                  MapMsg.edit(Map);
                  totalGames[players.indexOf(msg.author.id)] += 1;
                  db.collection("sokoban").doc(msg.guild.id).update({
                    totalGames: totalGames,
                  });
                  Game = false;
                }
              });
            });
        }
      });
  }
};

module.exports.help = {
  name: "sokoban",
};
