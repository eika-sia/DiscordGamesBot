const discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, userId) => {
  /* 
    TODO Empty map gen
    TODO Make a regenerating loop
    TODO make pieces move down (something like snake?)
    TODO check for full lines and del. them
    TODO make blocks fall
  */

  let ArgsF = new Array();
  ArgsF = args;
  if (ArgsF.length === 0) {
    const help = new discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("How to play tetris")
      .setDescription("Press the keys to move")
      .addFields();
    msg.channel.send(help);
  } else {
    if (args[0] === "start") {
      //? 0, 90, 180, 270 degrees seperate, current state of the moving block arrays which move? steal snake??
      const wall = 7; //🟫
      const bg = 8; // ⬛
      let Opiece, Ipiece, Zpiece, Spiece, Jpiece, Lpiece, Tpiece;
      function GeneratePieces() {
        Opiece = {
          color: "🟪",
          number: 0,
          positions: {
            turn0: [
              [0, -1],
              [-1, -1],
              [-1, 0],
            ],
            turn1: [
              [0, -1],
              [-1, -1],
              [-1, 0],
            ],
            turn2: [
              [0, -1],
              [-1, -1],
              [-1, 0],
            ],
            turn3: [
              [0, -1],
              [-1, -1],
              [-1, 0],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Ipiece = {
          color: "🟩",
          number: 1,
          positions: {
            turn0: [
              [0, -2],
              [0, -1],
              [0, 1],
            ],
            turn1: [
              [1, 0],
              [-1, 0],
              [-2, 0],
            ],
            turn2: [
              [0, -2],
              [0, -1],
              [0, 1],
            ],
            turn3: [
              [1, 0],
              [-1, 0],
              [-2, 0],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Zpiece = {
          color: "🟥",
          number: 2,
          positions: {
            turn0: [
              [0, -1],
              [-1, 0],
              [1, -1],
            ],
            turn1: [
              [0, -1],
              [1, 0],
              [1, 1],
            ],
            turn2: [
              [0, -1],
              [1, 0],
              [1, 1],
            ],
            turn3: [
              [0, -1],
              [1, 0],
              [1, 1],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Spiece = {
          color: "🟦",
          number: 3,
          positions: {
            turn0: [
              [0, -1],
              [1, 0],
              [-1, -1],
            ],
            turn1: [
              [1, 0],
              [0, 1],
              [1, -1],
            ],
            turn2: [
              [0, -1],
              [1, 0],
              [-1, -1],
            ],
            turn3: [
              [1, 0],
              [0, 1],
              [1, -1],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Jpiece = {
          color: "🟨",
          number: 4,
          positions: {
            turn0: [
              [-1, 0],
              [1, -1],
              [1, 0],
            ],
            turn1: [
              [0, 1],
              [1, 1],
              [0, -1],
            ],
            turn2: [
              [-1, 1],
              [0, -1],
              [0, 1],
            ],
            turn3: [
              [-1, -1],
              [0, -1],
              [0, 1],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Lpiece = {
          color: "⬜",
          number: 5,
          positions: {
            turn0: [
              [-1, 0],
              [1, 0],
              [-1, -1],
            ],
            turn1: [
              [0, 1],
              [1, -1],
              [0, -1],
            ],
            turn2: [
              [1, 1],
              [-1, 0],
              [1, 0],
            ],
            turn3: [
              [0, 1],
              [0, -1],
              [-1, 1],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
        Tpiece = {
          color: "🟧",
          number: 6,
          positions: {
            turn0: [
              [0, -1],
              [1, 0],
              [-1, 0],
            ],
            turn1: [
              [1, 0],
              [0, 1],
              [0, -1],
            ],
            turn2: [
              [1, 0],
              [-1, 0],
              [0, 1],
            ],
            turn3: [
              [0, 1],
              [0, -1],
              [-1, 0],
            ],
          },
          InBag: true,
          PivotPos: [2, 6],
        };
      }
      const left = [0, -1];
      const right = [0, 1];

      const TableRows = 16;
      const TableCols = 12;

      let PlayingField = [];
      for (i = 0; i < TableRows; i++) {
        PlayingField.push([]);
      }
      GeneratePieces();
      //*Map generation (one time use ig but it's nice to have it as a function)
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
      }

      //blocks - 🟪 🟩 🟥 🟦 🟨 ⬜ 🟧 wall-🟫  bg -  ⬛
      let PlayingEmbed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription("");

      //This will be a commonly used function Like every update
      function render() {
        PlayingEmbed.setDescription("");
        for (i = 0; i < TableRows; i++) {
          for (j = 0; j < TableCols; j++) {
            if (PlayingField[i][j] === bg) {
              PlayingEmbed.setDescription(`${PlayingEmbed.description}⬛`);
            } else if (PlayingField[i][j] === wall) {
              PlayingEmbed.setDescription(`${PlayingEmbed.description}🟫`);
            } else if (PlayingField[i][j] === Opiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Opiece.color}`
              );
            } else if (PlayingField[i][j] === Ipiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Ipiece.color}`
              );
            } else if (PlayingField[i][j] === Spiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Spiece.color}`
              );
            } else if (PlayingField[i][j] === Zpiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Zpiece.color}`
              );
            } else if (PlayingField[i][j] === Lpiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Lpiece.color}`
              );
            } else if (PlayingField[i][j] === Jpiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Jpiece.color}`
              );
            } else if (PlayingField[i][j] === Tpiece.number) {
              PlayingEmbed.setDescription(
                `${PlayingEmbed.description}${Tpiece.color}`
              );
            }
          }
          PlayingEmbed.setDescription(`${PlayingEmbed.description}\n`);
        }
      }

      let Orientation = 0;
      MapGen();
      render();
      let MapMsg = await msg.channel.send(PlayingEmbed);
      let Alert = await msg.channel.send("Please allow 5 seconds to prepare!");
      msg.react("⬅️");
      msg.react("➡️");
      msg.react("↪️");
      msg.react("↩️");
      msg.react("⬇️");
      msg.react("⏹️");
      function DestroyMsg() {
        setTimeout(function () {
          Alert.delete();
        }, 2000);
      }
      setTimeout(function () {
        Alert.edit("You can start now!");
        DestroyMsg();
        GetPiece();
        Gameplay();
      }, 5000);

      let LeftPieces = ["O", "I", "S", "Z", "L", "J", "T"];
      let CurrentObj;
      function GetPiece() {
        //Removing a random piece from the list while leaving it saved!

        let PieceNumTemp = Math.floor(Math.random() * (LeftPieces.length - 1));
        let CurrentPiece = LeftPieces[PieceNumTemp];
        LeftPieces.splice(PieceNumTemp, 1);
        if (CurrentPiece === "O") {
          CurrentObj = Opiece;
        } else if (CurrentPiece === "I") {
          CurrentObj = Ipiece;
        } else if (CurrentPiece === "S") {
          CurrentObj = Spiece;
        } else if (CurrentPiece === "Z") {
          CurrentObj = Zpiece;
        } else if (CurrentPiece === "L") {
          CurrentObj = Lpiece;
        } else if (CurrentPiece === "J") {
          CurrentObj = Jpiece;
        } else {
          //CurrentPiece === "T"
          CurrentObj = Tpiece;
        }
      }

      function MoveDown(obj) {
        obj.PivotPos[0] = obj.PivotPos[0] + 1;
        if (PlayingField[obj.PivotPos[0]][obj.PivotPos[1]] != bg) {
          obj.PivotPos[0] = obj.PivotPos[0] - 1;

          return (obj.InBag = false);
        }
      }
      function RenderObj(obj) {
        let TempSave = PlayingField.map((x) => x.slice());
        let Positions;
        let PivotPoint;

        PivotPoint = obj.PivotPos;

        if (Orientation === 0) {
          Positions = obj.positions.turn0;
        } else if (Orientation === 90) {
          Positions = obj.positions.turn1;
        } else if (Orientation === 180) {
          Positions = obj.positions.turn2;
        } else if (Orientation === 270) {
          Positions = obj.positions.turn3;
        }

        for (i = 0; i < 3; i++) {
          let TempRow = Positions[i][0];
          let TempCol = Positions[i][1];

          TempRow = TempRow + PivotPoint[0];
          TempCol = TempCol + PivotPoint[1];

          if (PlayingField[TempRow][TempCol] === bg) {
            PlayingField[TempRow][TempCol] = obj.number;
          } else {
            obj.PivotPos[0] = obj.PivotPos[0] - 1;
            PlayingField = TempSave;
            obj.InBag = false;
            return RenderObj(obj);
          }
        }

        PlayingField[PivotPoint[0]][PivotPoint[1]] = obj.number;

        for (i = 0; i < TableCols; i++) {
          PlayingField[0][i] = wall;
        }
      }

      function Move(obj, direction) {
        let TempRow = obj.PivotPos[0];
        let TempCol = obj.PivotPos[1];

        TempRow = TempRow + direction[0];
        TempCol = TempCol + direction[1];

        obj.PivotPos[0] = TempRow;
        obj.PivotPos[1] = TempCol;

        let Positions;
        let PivotPoint;

        PivotPoint = obj.PivotPos;

        if (Orientation === 0) {
          Positions = obj.positions.turn0;
        } else if (Orientation === 90) {
          Positions = obj.positions.turn1;
        } else if (Orientation === 180) {
          Positions = obj.positions.turn2;
        } else if (Orientation === 270) {
          Positions = obj.positions.turn3;
        }

        for (i = 0; i < 3; i++) {
          let TempRow2 = Positions[i][0];
          let TempCol2 = Positions[i][1];

          TempRow2 = TempRow2 + PivotPoint[0];
          TempCol2 = TempCol2 + PivotPoint[1];

          if (PlayingField[TempRow2][TempCol2] != bg) {
            obj.PivotPos[0] = obj.PivotPos[0] - direction[0];
            obj.PivotPos[1] = obj.PivotPos[1] - direction[1];
          }
        }
      }

      function ClearObj(obj) {
        let Positions;
        let PivotPoint;
        PivotPoint = obj.PivotPos;
        if (Orientation === 0) {
          Positions = obj.positions.turn0;
        } else if (Orientation === 90) {
          Positions = obj.positions.turn1;
        } else if (Orientation === 180) {
          Positions = obj.positions.turn2;
        } else if (Orientation === 270) {
          Positions = obj.positions.turn3;
        }

        PlayingField[obj.PivotPos[0]][obj.PivotPos[1]] = bg;
        for (i = 0; i < 3; i++) {
          let TempRow = Positions[i][0];
          let TempCol = Positions[i][1];

          TempRow = TempRow + PivotPoint[0];
          TempCol = TempCol + PivotPoint[1];

          PlayingField[TempRow][TempCol] = bg;
        }
      }

      function DropDown(obj) {
        while (obj.InBag === true) {
          MoveDown(obj);
        }
      }

      let ReactionCollector;
      let score = 0;
      function Gameplay() {
        if (CurrentObj.InBag === false) {
          Orientation = 0;
          GetPiece();

          if (LeftPieces.length === 0) {
            LeftPieces = ["O", "I", "S", "Z", "L", "J", "T"];
            GeneratePieces();
          }
          let EmptyRow = [];
          for (let q = 0; q < TableCols; q++) {
            EmptyRow[q] = bg;
          }
          EmptyRow[0] = wall;
          EmptyRow[EmptyRow.length - 1] = wall;
          for (let p = TableRows - 2; p > 0; ) {
            let NofBlcoks = 0;
            for (let j = 1; j < TableCols - 1; j++) {
              if (PlayingField[p][j] === bg) {
                j = TableCols;
              } else {
                NofBlcoks++;
              }
            }
            //console.log("1")
            if (NofBlcoks === TableCols - 2) {
              //console.log("2")
              PlayingField[p] = EmptyRow;
              //console.log("5")
              NofBlcoks = 0;

              for (let t = p; t > 1; t--) {
                PlayingField[t] = PlayingField[t - 1];
                PlayingField[t - 1] = EmptyRow;
              }
              score = score + 100;
              //sconsole.log(score);
            }
            p = p - 1;
          }
          for (s = 0; s < TableCols; s++) {
            PlayingField[TableRows - 1][s] = wall;
            //console.log("4")
          }
          render();
          MapMsg.edit(PlayingEmbed);
          //console.log("Success2")
          return Gameplay();
        }
        let RealEnd = true;

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

        CurrentObj.InBag = true;

        ReactionCollector = msg.createReactionCollector(Reactionfilter, {
          time: 2000,
        });

        ReactionCollector.on("collect", (reaction, user) => {
          if (reaction.emoji.name === "⬅️") {
            ClearObj(CurrentObj);
            Move(CurrentObj, left);

            RealEnd = false;
            ReactionCollector.stop();

            RenderObj(CurrentObj);
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

            return Gameplay();
          } else if (reaction.emoji.name === "➡️") {
            ClearObj(CurrentObj);
            Move(CurrentObj, right);

            RealEnd = false;
            ReactionCollector.stop();

            RenderObj(CurrentObj);
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

            return Gameplay();
          } else if (reaction.emoji.name === "↪️") {
            ClearObj(CurrentObj);

            Orientation = Orientation - 90;
            if (Orientation > 270) {
              Orientation = 0;
            } else if (Orientation < 0) {
              Orientation = 270;
            }

            RenderObj(CurrentObj);
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
          } else if (reaction.emoji.name === "↩️") {
            ClearObj(CurrentObj);

            Orientation = Orientation - 90;
            if (Orientation > 270) {
              Orientation = 0;
            } else if (Orientation < 0) {
              Orientation = 270;
            }

            RenderObj(CurrentObj);
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
          } else if (reaction.emoji.name === "⏹️") {
            msg.channel.send("Stopped!");

            RealEnd = false;
            ReactionCollector.stop();

            return;
          } else if (reaction.emoji.name === "⬇️") {
            ClearObj(CurrentObj);
            DropDown(CurrentObj);

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

            RenderObj(CurrentObj);
            render();
            MapMsg.edit(PlayingEmbed);

            RealEnd = false;
            ReactionCollector.stop();
            return Gameplay();
          }
        });

        ReactionCollector.on("end", () => {
          if (RealEnd === true) {
            ClearObj(CurrentObj);
            MoveDown(CurrentObj);

            RenderObj(CurrentObj);

            render();
            //MapMsg.edit(PlayingEmbed);
            MapMsg.edit(PlayingEmbed);
            RealEnd = false;
            ReactionCollector.stop();

            return Gameplay();
          }
        });
      }
    }
  }
};

module.exports.help = {
  name: "tetris",
};
