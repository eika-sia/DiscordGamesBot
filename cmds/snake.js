const Discord = require("discord.js");

module.exports.run = async (bot, msg, args, db, UserId) => {
  /**
   * ? 1. Generate a grid, Sokobans generation should work - done
   * ? 2. Generate a starting position for food and for snake, Sokobans generation should work - done
   * ? 3. Make snake move, intervals could work good - done
   * ? 4. Make Snake an array of positions (better if we do it from the start) - done
   * TODO 5. Make snake expandable, for loop that applies same +-x +-y
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
          value: "Returns top 3 players of sokoban",
        }
      );
    msg.channel.send(snakeHelp);
  }
  if (argsF[0] === "start") {
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
      .setDescription("");

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

    let MapMsg;
    async function Draw1st() {
      MapMsg = await msg.channel.send(PlayingEmbed);
      Gameplay();
    }

    //*Starting the game
    MapGen();
    render();
    Draw1st().catch((err) => {});

    function snakeMove(direction) {
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
    }

    let Direction = "";
    //*Main loop of the game
    function Gameplay() {
      //TODO Checks for diff stuff (Winning - apple collections, loosing - hitting the wall - eating yourself {make something fun like bit off insted of loose})
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

          //TODO add the snake add a part on the back
          let TempRow = SnakePosArray[SnakePosArray.length - 1][0];
          let TempCol = SnakePosArray[SnakePosArray.length - 1][1];

          if (Direction === "w") {
            TempRow = TempRow + 1;
          } else if (Direction === "s") {
            TempRow = TempRow - 1;
          } else if (Direction === "d") {
            TempCol = TempCol - 1;
          } else if (Direction === "a") {
            TempCol = TempCol + 1;
          }

          PlayingField[TempRow][TempCol] = snakeBody;
          SnakePosArray[SnakePosArray.length] = [TempRow, TempCol];

          render();
          msg.channel.send(PlayingEmbed);
          return Gameplay();
        }
      }

      const filter = (m) => m.author.id === msg.author.id;
      msg.channel
        .awaitMessages(filter, {
          max: 1,
          time: 2000,
        })
        .then((collected) => {
          if (collected.first().content === "stop") {
            return msg.channel.send("Stopped!");
          } else if (collected.first().content === "w") {
            snakeMove(up);

            render();
            msg.channel.send(PlayingEmbed);
            msg.channel.bulkDelete(1, true);
            Direction = "w";
            Gameplay();
          } else if (collected.first().content === "s") {
            snakeMove(down);
            TempRow = SnakePosArray[0][0];
            TempCol = SnakePosArray[0][1];
            render();
            msg.channel.send(PlayingEmbed);
            msg.channel.bulkDelete(1, true);
            Direction = "s";
            Gameplay();
          } else if (collected.first().content === "a") {
            snakeMove(left);

            render();
            msg.channel.send(PlayingEmbed);
            msg.channel.bulkDelete(1, true);
            Direction = "a";
            Gameplay();
          } else if (collected.first().content === "d") {
            snakeMove(right);

            render();
            msg.channel.send(PlayingEmbed);
            msg.channel.bulkDelete(1, true);
            Direction = "d";
            Gameplay();
          }
        })
        .catch((err) => {
          if (Direction === "w") {
            snakeMove(up);

            render();
            msg.channel.send(PlayingEmbed);

            Gameplay();
          } else if (Direction === "s") {
            snakeMove(down);

            render();
            msg.channel.send(PlayingEmbed);

            Gameplay();
          } else if (Direction === "a") {
            snakeMove(left);

            render();
            msg.channel.send(PlayingEmbed);

            Gameplay();
          } else if (Direction === "d") {
            snakeMove(right);

            render();
            msg.channel.send(PlayingEmbed);

            Gameplay();
          } else if (Direction === "") {
            snakeMove(right);

            render();
            msg.channel.send(PlayingEmbed);

            Gameplay();
          }
          return;
        });
    }
  }
};

module.exports.help = {
  name: "snake",
};