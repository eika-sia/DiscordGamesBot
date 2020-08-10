module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    const fs = require('fs');

    let Prefix;

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            Prefix = q.data().prefix;
        }
    }).then(() => {

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
                .addFields({
                    name: `${Prefix}blackjack hit`,
                    value: 'Get another card!'
                }, {
                    name: `${Prefix}blackjack stay`,
                    value: "Stop getting cards for the round!"
                }, {
                    name: `${Prefix}blackjack start [bet]`,
                    value: 'Start the game'
                }, )
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
                    msg.channel.send("Starting new game!");
                    if (!players.includes(msg.author.id)) {
                        console.log("adding new user! " + msg.author.id);
                        //Add 
                        players.push(msg.author.id);
                        credits.push(200);
                        PlayerNames.push(msg.author.username);
                    }
                    if (argsF.length == 2) {
                        if (credits[players.indexOf(msg.author.id)] >= parseInt(args[1])) {
                            credits[players.indexOf(msg.author.id)] = credits[players.indexOf(msg.author.id)] - parseInt(args[1]);
                            draw1 = Math.floor(Math.random() * 13);
                            draw2 = Math.floor(Math.random() * 13);
                            if (draw1 > 10) {}
                            console.log("New Game by " + msg.author.id);
                            console.log(draw1);
                            console.log(draw2);
                            game = true;
                            total = 0;

                            const BjCommands = new Discord.MessageEmbed().setColor("RANDOM")
                                .setTitle("-=Commands=-")
                                .addFields({
                                    name: `${Prefix}blackjack hit`,
                                    value: "Get 1 more card"
                                }, {
                                    name: `${Prefix}blackjack stay`,
                                    value: "Stop getting cards, will finish the match"
                                })

                            msg.channel.send(BjCommands)
                            //loading stuff ya know
                            let CardPull1 = new Discord.MessageEmbed().setColor("#52eb34")
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
                                CardPull1.addFields({
                                    name: "You pulled a",
                                    value: `${royals[(draw2)-10]} and a ${royals[(draw1) - 10]} for a ${total} of 20`
                                })

                            } else if (draw1 > 9) {
                                if (draw1 = 10) {
                                    total = 1 + draw1 + draw2;
                                } else if (draw1 = 11) {
                                    total = draw1 + draw2;
                                } else {
                                    total = draw1 + draw2 - 1
                                }
                                CardPull1.addFields({
                                    name: "You pulled a",
                                    value: `${cardNums[draw2]} and a ${royals[(draw1) - 10]} for a total of ${total}`
                                })

                            } else if (draw2 > 9) {
                                if (draw2 = 10) {
                                    total = 1 + draw1 + draw2;
                                } else if (draw2 = 11) {
                                    total = draw1 + draw2;
                                } else {
                                    total = draw1 + draw2 - 1
                                }
                                CardPull1.addFields({
                                    name: "You pulled a",
                                    value: `${royals[(draw2) - 10]} and a ${cardNums[draw1]} for a total of ${total}`
                                })

                            } else {
                                total = 2 + draw1 + draw2;
                                CardPull1.addFields({
                                    name: "You pulled a",
                                    value: `${cardNums[draw2]} and a ${cardNums[draw1]} for a total of ${total}`
                                })
                            }
                            msg.channel.send(CardPull1)
                            db.collection('blackjack').doc(msg.guild.id).update({
                                'credits': credits,
                                'players': players,
                                'game': game,
                                'total': total,
                                'playersName': PlayerNames,
                                'bet': args[1]
                            });
                        } else {
                            msg.channel.send("You don't have enough money to play with this bet. *if on 0 msg me (GameMasterCRO, Goran#0372) to give you 50 credits, only on a daily basis!")
                        }
                    } else {
                        msg.channel.send(`Please use the command ${prefix}blackjack start [bet]`);
                    }
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
                let CardPull2 = new Discord.MessageEmbed().setColor("#e8d938");
                if (args[0] == "hit" && game == true) {
                    card3 = Math.floor(Math.random() * 13);
                    if (card3 >= 10) {
                        card3 = 10;
                        c3f[Math.floor(Math.random() * 3)];
                        total += card3;
                        CardPull2.addFields({
                            name: "You pulled a",
                            value: `${c3f[Math.floor(Math.random() * 3)]} and had ${total}`
                        })
                    } else {
                        total = total + 1 + card3;
                        CardPull2.addFields({
                            name: "You pulled a",
                            value: `${cardNums[card3]} and had a total of ${total}`
                        })
                    }
                    msg.channel.send(CardPull2);
                    let Busted = new Discord.MessageEmbed().setColor("#a528ed")
                    msg.channel.send("Your new Total is " + total);
                    if (total > 21) {
                        Busted.setTitle("Bust!");
                        game = false;
                        db.collection('blackjack').doc(msg.guild.id).update({
                            'game': false,
                            'total': 0
                        });
                        Busted.addFields({
                            name: "You now have ",
                            value: `${credits[players.indexOf(msg.author.id)]} credits`
                        })
                        msg.channel.send(Busted);
                        if (credits[players.indexOf(msg.author.id)] === 0) {
                            msg.channel.send("Hmm looks like you are broke, here have 50 credits so you can earn up more!");
                            credits[players.indexOf(msg.author.id)] = credits[players.indexOf(msg.author.id)] + 50;
                        }

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
            let WinMoney
            db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
                if (q.exists) {
                    credits = q.data().credits;
                    players = q.data().players;
                    game = q.data().game;
                    total = q.data().total;
                    WinMoney = q.data().bet;
                }
            }).then(() => {
                WinMoney = WinMoney * 2 + credits[players.indexOf(msg.author.id)];
                //parseInt(credits[players.indexOf(msg.author.id)]) +
                if (args[0] == "stay" && game == true) {
                    let WinLooseF = new Discord.MessageEmbed().setColor("#e37b27")
                    var dealerTotal = Math.floor(Math.random() * 6) + 17;
                    WinLooseF.addFields({
                        name: "You stood at a final total of ",
                        value: `${total}`
                    }, {
                        name: "The dealer stood with a total of ",
                        value: `${dealerTotal}`
                    });
                    if (total <= dealerTotal && dealerTotal <= 21) {
                        WinLooseF.setTitle("You Lose!");
                    } else {
                        WinLooseF.setTitle("You Win!");
                        credits[players.indexOf(msg.author.id)] = WinMoney;
                    }
                    game = false;
                    db.collection('blackjack').doc(msg.guild.id).update({
                        'game': false,
                        'total': 0
                    })
                    WinLooseF.addFields({
                        name: "You now have ",
                        value: `${credits[players.indexOf(msg.author.id)]} credits`
                    })
                    if (credits[players.indexOf(msg.author.id)] === 0) {
                        msg.channel.send("Hmm looks like you are broke, here have 50 credits so you can earn up more!");
                        credits[players.indexOf(msg.author.id)] = credits[players.indexOf(msg.author.id)] + 50;
                    }
                    msg.channel.send(WinLooseF)
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
                    let Credits = new Discord.MessageEmbed().setColor("RANDOM")
                        .setTitle("Credit balance")
                        .addFields({
                            name: "You currently have ",
                            value: `${credits[players.indexOf(msg.author.id)]} credits!`
                        })
                    msg.channel.send(Credits);
                    db.collection('blackjack').doc(msg.guild.id).update({
                        'credits': credits,
                        'players': players,
                        'game': game,
                        'total': total
                    });
                }
            })
        }
        db.collection('blackjack').doc(msg.guild.id).get().then((q) => {
            if (q.exists) {
                credits = q.data().credits;
                players = q.data().playersName;
            }
        }).then(() => {
            if (args[0] === 'top') {
                let len = credits.length;
                for (let i = 0; i < len; i++) {
                    for (let j = 0; j < len; j++) {
                        if (credits[j] < credits[j + 1]) {
                            let tmp = credits[j];
                            let tmp2 = players[j];
                            credits[j] = credits[j + 1];
                            players[j] = players [j + 1];
                            credits[j + 1] = tmp;
                            players[j + 1] = tmp2;
                        }
                    }
                }
                const BjTop = new Discord.MessageEmbed()
                    .setTitle("Top blackjack players:")
                    .setColor("RANDOM")
                    .addFields({
                        name: `1. ${players[0]}`,
                        value: `Balance: ${credits[0]}`
                    }, {
                        name: `2. ${players[1]}`,
                        value: `Balance: ${credits[1]}`
                    }, {
                        name: `3. ${players[2]}`,
                        value: `Balance: ${credits[2]}`
                    });
                msg.channel.send(BjTop);
            }
        });
    });
}

module.exports.help = {
    name: "blackjack"
}