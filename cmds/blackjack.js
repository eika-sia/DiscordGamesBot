const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    const fs = require('fs');

    var argsF = new Array();
    argsF = args;

    var draw1;
    var draw2;
    var players = [];
    var credits = [];
    var cardNums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
    var royals = ["Jack", "Queen", "King"];
    var card3 = Math.floor(Math.random() * 13);
    var game = false;
    var total = 0;
    var c3f = ["10", "Jack", "Queen", "King"];

    if (argsF.length === 0) {
        //Help file
        const HelpEmbeded3 = new Discord.MessageEmbed()
            .setColor('#e01010')
            .setTitle("It's time to play blackjack!")
            .setAuthor("tbh I don't know who")
            .setDescription('What will happen now!')
            .addFields(
                { name: '&blackjack hit', value: 'Get another card!' },
                { name: '&blackjack stand', value: "Stop getting cards for the round!" },
                { name: "&blackjack start [bet]", value: 'Start the game' },
            )
            .setTimestamp()
            .setFooter('What are you searching for down here?');
        msg.channel.send(HelpEmbeded3);
    } else {
        //Game
        var PlayerNames = new Array();
        db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                credits = q.data().credits;
                players = q.data().players;
                game = q.data().game;
                total = q.data().total;
                PlayerNames = q.data().playersName;
            }
        }).then(() => {

            if (args[0] == "start" && game == false) {
                msg.channel.send("Starting new game");
                if (!players.includes(msg.author.id)) {
                    console.log("adding new user! " + msg.author.id);
                    //Add 
                    players.push(msg.author.id);
                    credits.push(200);
                    PlayerNames.push(msg.author.username);
                }
                if (argsF.length != 2) {
                    if (credits[players.indexOf(msg.author.id)] > parseInt(args[1])) {
                        credits[players.indexOf(msg.author.id)] = credits[players.indexOf(msg.author.id)] - parseInt(args[1]) ;
                        draw1 = Math.floor(Math.random() * 13);
                        draw2 = Math.floor(Math.random() * 13);
                        if (draw1 > 10) { }
                        console.log("New Game by " + msg.author.id);
                        console.log(draw1);
                        console.log(draw2);
                        game = true;
                        total = 0;
                        msg.channel.send("--Commands--");
                        msg.channel.send("?hit - draws new card to add to total");
                        msg.channel.send("?stay - keeps current cards for final amount");
                        //loading stuff ya know
                        if (draw1 > 9 && draw2 > 9) {
                            if (draw2 = 10) {
                                total = 1 + draw1 + draw2;
                            } else if (draw = 11) {
                                total = draw1 + draw2;
                            } else {
                                total = draw1 + draw2 - 1;
                            }
                            if (draw2 = 10) {
                                total += 1;
                            } else {
                                total -= 1;
                            }
                            msg.channel.send("You pulled a " + royals[(draw2) - 10] + " and a " + royals[(draw1) - 10] + " for a total of 20");

                        } else if (draw1 > 9) {
                            if (draw1 = 10) {
                                total = 1 + draw1 + draw2;
                            } else if (draw1 = 11) {
                                total = draw1 + draw2;
                            } else {
                                total = draw1 + draw2 - 1
                            }
                            msg.channel.send("You pulled a " + cardNums[draw2] + " and a " + royals[(draw1) - 10] + " for a total of " + total);

                        } else if (draw2 > 9) {
                            if (draw2 = 10) {
                                total = 1 + draw1 + draw2;
                            } else if (draw2 = 11) {
                                total = draw1 + draw2;
                            } else {
                                total = draw1 + draw2 - 1
                            }
                            msg.channel.send("You pulled a " + royals[(draw2) - 10] + " and a " + cardNums[draw1] + " for a total of " + total);

                        } else {
                            total = 2 + draw1 + draw2;
                            msg.channel.send("You pulled a " + cardNums[draw2] + " and a " + cardNums[draw1] + " for a total of " + total);
                        }
                        db.collection('blackjack').doc(msg.guild.id).update({
                            'credits': credits,
                            'players': players,
                            'game': game,
                            'total': total,
                            'playersName': PlayerNames,
                        });
                    }
                } else {
                    msg.channel.send("you don't have enough money to play with this bet. *if on 0 msg me (GameMasterCRO, Goran#0372) to give you 50 credits, only on a daily basis!")
                }
            } else {
                msg.channel.send("Please use the command {prefix}blackjack start [bet]")
            }
        });

        //hit?
        db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                credits = q.data().credits;
                players = q.data().players;
                game = q.data().game;
                total = q.data().total;
            }
        }).then(() => {
            if (args[0] == "hit" && game == true) {
                card3 = Math.floor(Math.random() * 13);
                if (card3 >= 10) {
                    card3 = 10;
                    c3f[Math.floor(Math.random() * 3)];
                    msg.channel.send("You pulled a " + c3f[Math.floor(Math.random() * 3)] + " and had " + total);
                    total += card3;
                } else {
                    msg.channel.send("You pulled a " + cardNums[card3] + " and had a total of " + total);
                    total = total + 1 + card3
                }
                msg.channel.send("Your new Total is " + total);
                if (total > 21) {
                    msg.channel.send("Bust!");
                    game = false;
                    db.collection('blackjack').doc(msg.guild.id).update({
                        game: false,
                        total: 0
                    });
                    msg.channel.send("You now have " + credits[players.indexOf(msg.author.id)] + " credits");

                }
                db.collection('blackjack').doc(msg.guild.id).update({
                    'credits': credits,
                    'players': players,
                    'game': game,
                    'total': total
                });
            }
        });

        //"staying" homE during the pandemic!
        db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                credits = q.data().credits;
                players = q.data().players;
                game = q.data().game;
                total = q.data().total;
            }
        }).then(() => {
            if (args[0] == "stay" && game == true) {
                var dealerTotal = Math.floor(Math.random() * 6) + 17;
                msg.channel.send("You stood at a final total of " + total);
                msg.channel.send("The dealer stood with a total of " + dealerTotal);
                if (total <= dealerTotal && dealerTotal <= 21) {
                    msg.channel.send("You Lose");
                } else {
                    msg.channel.send("You Win!");
                    credits[players.indexOf(msg.author.id)] = credits[players.indexOf(msg.author.id)] + parseInt(args[1])*2;
                }
                game = false;
                db.collection('blackjack').doc(msg.guild.id).update({
                    game: false,
                    total: 0
                })
                msg.channel.send("You now have " + credits[players.indexOf(msg.author.id)] + " credits");
                db.collection('blackjack').doc(msg.guild.id).update({
                    'credits': credits,
                    'players': players,
                    'game': game,
                    'total': total
                });
            }
        });

        db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                credits = q.data().credits;
                players = q.data().players;
                game = q.data().game;
                total = q.data().total;
            }
        }).then(() => {
            if (args[0] == "credits" && players.includes(msg.author.id)) {
                msg.channel.send("You currently have " + credits[players.indexOf(msg.author.id)] + "credits!");
                db.collection('blackjack').doc(msg.guild.id).update({
                    'credits': credits,
                    'players': players,
                    'game': game,
                    'total': total
                });
            }
        })
    }
}

module.exports.help = {
    name: "blackjack"
}