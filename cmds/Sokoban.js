module.exports.run = async (bot, msg, args, db, UserId) => {

    const Discord = require('discord.js');
    let players, wins;
    db.collection('sokoban').doc(msg.guild.id).get().then((q) => {
        //Getting variables from Firebase
        if (q.exists) {
            players = q.data().players;
            wins = q.data().wins;
        }
    }).then(() => {
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
                })
                .setColor("RANDOM");
            //Sending the first msgs
            msg.channel.send("Doing math in background for optimal gameplay")
            msg.channel.send(SokobanHelp).then(r => r.delete(10000)).catch(err => {

            });
        }
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

        let Map = new Discord.MessageEmbed().setColor("RANDOM").setDescription("");

        if (Game === true) {
            //Adding players to the games save
            //if (!players.includes(UserId)) {
            //    console.log("adding new user! " + msg.author.id);
            //Add 
            //    players.push(UserId);
            //    wins.push(0);
            //}

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
                for (i = 0; i < 9; i++) {
                    MapArrayC[Row][i] = wall
                }
            }
            let j;

            function MidBg() {
                for (j = 1; j < 6; j++) {
                    for (i = 0; i < 8; i++) {
                        MapArrayC[j][0] = wall;
                        MapArrayC[j][i + 1] = Bg;
                        MapArrayC[j][8] = wall;
                    }
                }
            }
            //Calling the functions
            FullWall(0);
            MidBg();
            FullWall(6);

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
                BlockColPos = ColPos(2, 6);
                BlockRowPos = RowPos(2, 4);
                if (MapArrayC[BlockRowPos][BlockColPos] === ":black_large_square:") {
                    MapArrayC[BlockRowPos][BlockColPos] = block;
                    MapArrayC[BlockRowPos+1][BlockColPos] = block;
                    MapArrayC[BlockRowPos-1][BlockColPos] = block;
                    MapArrayC[BlockRowPos][BlockColPos+1] = block;
                    MapArrayC[BlockRowPos][BlockColPos-1] = block;
                    i++
                }
            }

            //player
            for (i = 0; i < 1;) {
                PlayerColPos = ColPos(1, 7);
                PlayerRowPos = RowPos(1, 5);
                if (MapArrayC[PlayerRowPos][PlayerColPos] === ":black_large_square:") {
                    MapArrayC[PlayerRowPos][PlayerColPos] = player;
                    i++
                }
            }

            //Target
            for (i = 0; i < 1;) {
                TargetColPos = ColPos(1, 7);
                TargetRowPos = RowPos(1, 5);
                if (MapArrayC[TargetRowPos][TargetColPos] === ":black_large_square:") {
                    MapArrayC[TargetRowPos][TargetColPos] = Target;
                    i++
                }
            }

            //death block you figure
            let SpawnPos = false;
            for (i = 0; i < 3;) {
                var Temp1 = ColPos(1, 7);
                var Temp2 = RowPos(1, 5);
                if (MapArrayC[Temp2][Temp1] === ":black_large_square:") {
                    MapArrayC[Temp2][Temp1] = DeathBlock;
                    DeathRow.push(Temp2);
                    DeathCol.push(Temp1);
                    i++
                }
            }

            function FillMap(array) {
                Map.setDescription("");
                for (i = 0; i < 7; i++) {
                    for (j = 0; j < 9; j++) {
                        Map.setDescription(`${Map.description}${array[i][j]}`)
                    }
                    Map.setDescription(`${Map.description}\n`)
                }
            }
            MapArrayC[BlockRowPos+1][BlockColPos] = ":black_large_square:";
            MapArrayC[BlockRowPos-1][BlockColPos] = ":black_large_square:";
            MapArrayC[BlockRowPos][BlockColPos+1] = ":black_large_square:";
            MapArrayC[BlockRowPos][BlockColPos-1] = ":black_large_square:";
            FillMap(MapArrayC);
            MapDraw();
            GamePlay();
        }
        //This function will be looped untill the end of the game
        let MapMsg;
        async function MapDraw() {
            //msg.channel.send(Map);
            MapMsg = await msg.channel.send(Map);
        }

        function GamePlay() {
            //Checking for winning
            if (TargetColPos === BlockColPos && BlockRowPos === TargetRowPos) {
                Map.setTitle("You win!");
                    MapMsg.edit(Map);
                    return;
            }
            //checking for loosing
            for (i = 0; i < 3; i++) {
                if (DeathCol[i] === BlockColPos && DeathRow[i] === BlockRowPos) {
                    Map.setTitle("You loose!");
                    MapMsg.edit(Map);
                    return;

                }
                if (DeathCol[i] === PlayerColPos && DeathRow[i] === PlayerRowPos) {
                    Map.setTitle("You loose!");
                    MapMsg.edit(Map);
                    return;
                }
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
                }

            }).catch(err => {
                Map.setTitle("Time expired!");
                MapMsg.edit(Map);
                Game = false;
            })
        }
    });
}

module.exports.help = {
    name: "Sokoban"
}