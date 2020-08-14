const {
    path
} = require('dotenv/lib/env-options');

module.exports.run = async (bot, msg, args, db, UserId) => {

    const Discord = require('discord.js')
    //help card for the game\
    let argsF = new Array();
    argsF = args;
    if (argsF.length === 0) {
        const SokobanHelp = new Discord.MessageEmbed()
            .setTitle("Sokoban!")
            .setDescription("You need to push boxes in designated areas!")
            .addFields({
                name: `${prefix}Sokoban start`,
                value: "Start the game"
            }, {
                name: "w, a, s, d",
                value: "move the player"
            }, {
                name: "cancel",
                value: "Stop the game (you can also win to stop it)"
            }, {
                name: "How to play?",
                value: "Enter w, a, s, d (standard controls) to move the charater over the map grid and push boxes! Write stop to stop the game"
            }, {
                name: "What are all the blocks?",
                value: ":purple_square: - wall, :regional_indicator_o: - movable block, \n ❎ - Your target, 😀 - You!"
            }, {
                name: `${prefix}Sokoban top`,
                value: "Returns top 3 players of sokoban"
            })
            .setColor("RANDOM");
        //Sending the first msgs
        msg.channel.send("Doing math in background for optimal gameplay")
        msg.channel.send(SokobanHelp).then(r => r.delete(10000)).catch(err => {

        });
    }
    if (args[0] === "top") {
        let playerNames = new Array(),
            wins = new Array(),
            totalGames = new Array();
        db.collection('sokoban').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                playerNames = q.data().playerNames;
                wins = q.data().wins;
                totalGames = q.data().totalGames;
            }
        }).then(() => {
            let WGratio = new Array();
            for (i = 0; i < wins.length; i++) {
                WGratio.push((wins[i] / totalGames[i]).toFixed(2));
            }
            let playerNames2 = playerNames.map(x => x.slice())
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
            const TopWins = new Discord.MessageEmbed().setColor("RANDOM").addFields([{
                    name: `${playerNames[0]}:`,
                    value: `${wins[0]}`
                },
                {
                    name: `${playerNames[1]}:`,
                    value: `${wins[1]}`
                },
                {
                    name: `${playerNames[2]}:`,
                    value: `${wins[2]}`
                },
            ]).setTitle("Top wins!");


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
            const TopWgRatio = new Discord.MessageEmbed().setColor("RANDOM").addFields([{
                    name: `${playerNames2[0]}:`,
                    value: `${WGratio[0]}`
                },
                {
                    name: `${playerNames2[1]}:`,
                    value: `${WGratio[1]}`
                },
                {
                    name: `${playerNames2[2]}:`,
                    value: `${WGratio[2]}`
                },
            ]).setTitle("Top win/game ratio!");
            msg.channel.send(TopWins);
            msg.channel.send(TopWgRatio);
        })
    } else {
        let players = new Array(),
            wins = new Array(),
            playerNames = new Array()
        let totalGames = new Array();
        db.collection('sokoban').doc(msg.guild.id).get().then((q) => {
            //Getting variables from Firebase
            if (q.exists) {
                players = q.data().players;
                wins = q.data().wins;
                playerNames = q.data().playerNames;
                totalGames = q.data().totalGames;
            }
        }).then(() => {
            let Game = false;
            if (args[0] === "start") {
                msg.channel.send("Sokoban is starting up!");
                Game = true;
            }

            //Defining some wars for later
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

            let grid = new Array();

            let Map = new Discord.MessageEmbed().setColor("RANDOM").setDescription("");

            if (Game === true) {
                //Adding players to the games save
                if (!players.includes(msg.author.id)) {
                    console.log("adding new user! " + msg.author.id);
                    //Add 
                    players.push(msg.author.id);
                    wins.push(0);
                    playerNames.push(msg.author.username);
                    console.log(typeof totalGames);
                    totalGames.push(0);
                    db.collection('sokoban').doc(msg.guild.id).update({
                        'players': players,
                        'wins': wins,
                        'playerNames': playerNames,
                        'totalGames': totalGames
                    })
                }

                //Basic static map

                //Variables for blocks
                const player = "😀";
                const wall = ":purple_square:";
                const block = ":regional_indicator_o:";
                const Target = "❎";
                const Bg = ":black_large_square:";
                const DeathBlock = "❌"

                //Setting up the map
                let i;

                //Filling in the array for an empty map
                var MapArrayC = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ]
                var MapArrayP = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ]

                //Functions so it's easier to read
                function FullWall(Row) {
                    for (i = 0; i < 13; i++) {
                        MapArrayC[Row][i] = wall
                    }
                }
                let j;

                function MidBg() {
                    for (j = 1; j < 9; j++) {
                        for (i = 0; i < 13; i++) {
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
                for (i = 0; i < 1;) {
                    BlockColPos = ColPos(3, 7);
                    BlockRowPos = RowPos(2, 6);
                    if (MapArrayC[BlockRowPos][BlockColPos] === ":black_large_square:") {
                        MapArrayC[BlockRowPos][BlockColPos] = block;
                        MapArrayC[BlockRowPos + 1][BlockColPos] = block;
                        MapArrayC[BlockRowPos - 1][BlockColPos] = block;
                        MapArrayC[BlockRowPos][BlockColPos + 1] = block;
                        MapArrayC[BlockRowPos][BlockColPos - 1] = block;
                        i++
                    }
                }

                //player
                for (i = 0; i < 1;) {
                    PlayerColPos = ColPos(2, 8);
                    PlayerRowPos = RowPos(2, 6);
                    if (MapArrayC[PlayerRowPos][PlayerColPos] === ":black_large_square:") {
                        MapArrayC[PlayerRowPos][PlayerColPos] = player;
                        i++
                    }
                }

                //Target
                for (i = 0; i < 1;) {
                    TargetColPos = ColPos(2, 8);
                    TargetRowPos = RowPos(2, 6);
                    if (MapArrayC[TargetRowPos][TargetColPos] === ":black_large_square:") {
                        MapArrayC[TargetRowPos][TargetColPos] = Target;
                        i++
                    }
                }

                //Evil boi spawning
                for (i = 0; i < 1;) {
                    EvilColPos = ColPos(1, 9);
                    EvilRowPos = RowPos(1, 7);
                    if (MapArrayC[EvilRowPos][EvilColPos] === ":black_large_square:") {
                        if (EvilRowPos === 1 || EvilRowPos === 7) {
                            MapArrayC[EvilRowPos][EvilColPos] = ":rage:"
                            i++
                        }
                        if (EvilColPos === 1 || EvilColPos === 9) {
                            MapArrayC[EvilRowPos][EvilColPos] = ":rage:"
                            i++
                        }
                    }
                }

                for (i = 0; i < 3;) {
                    DeathCol[i] = ColPos(1, 9);
                    DeathRow[i] = RowPos(1, 7);
                    if (MapArrayC[DeathRow[i]][DeathCol[i]] === ":black_large_square:") {
                        MapArrayC[DeathRow[i]][DeathCol[i]] = "❌";
                        i++
                    }
                }

                function FillMap(array) {
                    Map.setDescription("");
                    for (i = 0; i < 9; i++) {
                        for (j = 0; j < 11; j = j + 2) {
                            Map.setDescription(`${Map.description}${array[i][j]}`)
                            Map.setDescription(`${Map.description}${array[i][j+1]}`)
                        }
                        Map.setDescription(`${Map.description}\n`)
                    }
                }
                MapArrayC[BlockRowPos + 1][BlockColPos] = ":black_large_square:";
                MapArrayC[BlockRowPos - 1][BlockColPos] = ":black_large_square:";
                MapArrayC[BlockRowPos][BlockColPos + 1] = ":black_large_square:";
                MapArrayC[BlockRowPos][BlockColPos - 1] = ":black_large_square:";
                FillMap(MapArrayC);
                MapDraw();
                GamePlay();
            }
            //This function will be looped untill the end of the game
            let MapMsg;
            async function MapDraw() {
                //msg.channel.send(Map);
                MapMsg = await msg.channel.send(Map);
                EvilAlive = true;
            }

            //Evil bot pathfinding
            function pathfinding() {
                var Matrix = new Array();
                Matrix = MapArrayC.map(x => x.slice())

                //Formating to 0's and 1's
                for (i = 0; i < 9; i++) {
                    for (j = 0; j < 11; j++) {
                        if (Matrix[i][j] === "😀" || Matrix[i][j] === ":black_large_square:") {
                            Matrix[i][j] = "0";
                        } else {
                            Matrix[i][j] = "1";
                        }
                    }
                }
                const astar = require("../node_modules/javascript-astar/astar.js");
                var graph = new astar.Graph(Matrix);
                var start = graph.grid[EvilRowPos][EvilColPos];
                var end = graph.grid[PlayerRowPos][PlayerColPos];
                var result = astar.astar.search(graph, start, end);
                MapArrayC[EvilRowPos][EvilColPos] = ":black_large_square:";
                EvilRowPos = result[0].x;
                EvilColPos = result[0].y;
                MapArrayC[EvilRowPos][EvilColPos] = "😡";
            }

            function GamePlay() {
                //Checking for winning
                db.collection('sokoban').doc(msg.guild.id).get().then((q) => {
                    //Getting variables from Firebase
                    if (q.exists) {
                        players = q.data().players;
                        wins = q.data().wins;
                        playerNames = q.data().playerNames;
                        totalGames = q.data().totalGames;
                    }
                }).then(() => {
                    if (TargetColPos === BlockColPos && BlockRowPos === TargetRowPos) {
                        Map.setTitle("You win!");
                        MapMsg.edit(Map);
                        totalGames[players.indexOf(msg.author.id)] += 1;
                        wins[players.indexOf(msg.author.id)] += 1;
                        db.collection('sokoban').doc(msg.guild.id).update({
                            'wins': wins,
                            'totalGames': totalGames
                        });
                        return;
                    }
                    //checking for loosing
                    for (i = 0; i < DeathCol.length; i++) {
                        if (DeathCol[i] === BlockColPos && DeathRow[i] === BlockRowPos) {
                            Map.setTitle("You loose!");
                            MapMsg.edit(Map);
                            totalGames[players.indexOf(msg.author.id)] += 1;
                            db.collection('sokoban').doc(msg.guild.id).update({
                                'wins': wins,
                                'totalGames': totalGames
                            });
                            return;
                        }
                        if (DeathCol[i] === PlayerColPos && DeathRow[i] === PlayerRowPos) {
                            Map.setTitle("You loose!");
                            MapMsg.edit(Map);
                            totalGames[players.indexOf(msg.author.id)] += 1;
                            db.collection('sokoban').doc(msg.guild.id).update({
                                'wins': wins,
                                'totalGames': totalGames
                            });
                            return;
                        }
                    }

                    //Crushing the evil boi
                    if (EvilAlive) {
                        if (EvilColPos === BlockColPos && EvilRowPos === BlockRowPos) {
                            EvilAlive = false;
                            EvilColPos = "";
                            EvilRowPos = "";
                            return;
                        } else {
                            pathfinding();
                        }
                    }
                    if (EvilColPos === PlayerColPos && EvilRowPos === PlayerRowPos) {
                        Map.setTitle("You loose!");
                        MapMsg.edit(Map);
                        totalGames[players.indexOf(msg.author.id)] += 1;
                        db.collection('sokoban').doc(msg.guild.id).update({
                            'wins': wins,
                            'totalGames': totalGames
                        });
                        return;
                    }


                    //Filter mechanic
                    const filter = m => m.author.id === msg.author.id;


                    //Waiting for a response
                    msg.channel.awaitMessages(filter, {
                        max: 1,
                        time: 10000
                    }).then(collected => {
                        //one got the response do this: (I'll probably make it if statments and function the game calls)
                        //To add a function just add an if statment, If you want so game doesn't finish just add GamePlay(); at the end
                        if (collected.first().content === "stop") {
                            Game = false;
                            totalGames[players.indexOf(msg.author.id)] += 1;
                            db.collection('sokoban').doc(msg.guild.id).update({
                                'wins': wins,
                                'totalGames': totalGames
                            });
                            return msg.channel.send("Game stopped!");
                        } else if (collected.first().content === "w") {
                            //For undo

                            //Moving up
                            MapArrayC[PlayerRowPos][PlayerColPos] = ":black_large_square:"
                            PlayerRowPos = PlayerRowPos - 1;

                            //Checks for walls
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === ':purple_square:') {
                                PlayerRowPos = PlayerRowPos + 1;
                            }
                            //cehcks for target area
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === '❎') {
                                PlayerRowPos = PlayerRowPos + 1;
                            }

                            //Checks for the movable block
                            if (PlayerRowPos === BlockRowPos && BlockColPos === PlayerColPos) {
                                BlockRowPos = BlockRowPos - 1;
                                MapArrayC[BlockRowPos][BlockColPos] = ":regional_indicator_o:"
                            }
                            MapArrayC[PlayerRowPos][PlayerColPos] = "😀"
                            FillMap(MapArrayC);
                            MapMsg.edit(Map);
                            msg.channel.bulkDelete(1, true);
                            GamePlay();
                        } else if (collected.first().content === "a") {
                            //For undo


                            //moving left
                            MapArrayC[PlayerRowPos][PlayerColPos] = ":black_large_square:"
                            PlayerColPos = PlayerColPos - 1;

                            //Checks for walls
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === ':purple_square:') {
                                PlayerColPos = PlayerColPos + 1;
                            }
                            //checks for target area
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === "❎") {
                                PlayerColPos = PlayerColPos + 1;
                            }

                            //Checks for the movable block
                            if (PlayerRowPos === BlockRowPos && BlockColPos === PlayerColPos) {
                                BlockColPos = BlockColPos - 1;
                                MapArrayC[BlockRowPos][BlockColPos] = ":regional_indicator_o:"
                            }
                            MapArrayC[PlayerRowPos][PlayerColPos] = "😀"
                            FillMap(MapArrayC);
                            MapMsg.edit(Map);
                            msg.channel.bulkDelete(1, true);
                            GamePlay();
                        } else if (collected.first().content === "s") {
                            //For undo




                            MapArrayC[PlayerRowPos][PlayerColPos] = ":black_large_square:"
                            PlayerRowPos = PlayerRowPos + 1;

                            //Checks for walls
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === ':purple_square:') {
                                PlayerRowPos = PlayerRowPos - 1;
                            }
                            //checks for target area
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === '❎') {
                                PlayerRowPos = PlayerRowPos - 1;
                            }

                            //Checks for the movable block
                            if (PlayerRowPos === BlockRowPos && BlockColPos === PlayerColPos) {
                                BlockRowPos = BlockRowPos + 1;
                                MapArrayC[BlockRowPos][BlockColPos] = ":regional_indicator_o:"
                            }
                            MapArrayC[PlayerRowPos][PlayerColPos] = "😀"
                            FillMap(MapArrayC);
                            MapMsg.edit(Map);
                            msg.channel.bulkDelete(1, true);
                            GamePlay();
                        } else if (collected.first().content === "d") {
                            //For undo 

                            MapArrayC[PlayerRowPos][PlayerColPos] = ":black_large_square:"
                            PlayerColPos = PlayerColPos + 1;

                            //Checks for walls
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === ':purple_square:') {
                                PlayerColPos = PlayerColPos - 1;
                            }
                            //Checks for target area
                            if (MapArrayC[PlayerRowPos][PlayerColPos] === '❎') {
                                PlayerColPos = PlayerColPos - 1;
                            }

                            //Checks for the movable block
                            if (PlayerRowPos === BlockRowPos && BlockColPos === PlayerColPos) {
                                BlockColPos = BlockColPos + 1
                                MapArrayC[BlockRowPos][BlockColPos] = ":regional_indicator_o:"
                            }
                            MapArrayC[PlayerRowPos][PlayerColPos] = "😀"
                            FillMap(MapArrayC);
                            MapMsg.edit(Map);
                            msg.channel.bulkDelete(1, true);
                            GamePlay();
                        } else if (collected.first().content === "undo") {
                            //undo fuxtion
                            FillMap(MapArrayP);
                            MapMsg.edit(Map);
                            msg.channel.bulkDelete(1, true);
                            MapArrayC = MapArrayP
                            GamePlay();
                        } else {
                            msg.channel.bulkDelete(1, true);
                            GamePlay();
                        }

                    }).catch(err => {
                        Map.setTitle("Time expired!");
                        MapMsg.edit(Map);
                        Game = false;
                    })
                });
            }
        });
    }
}

module.exports.help = {
    name: "Sokoban"
}
