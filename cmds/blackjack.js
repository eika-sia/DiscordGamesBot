module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');
    const fs = require('fs');



    if (args[0] == 'create') {
        GameStart = false;
        players = args[1];
        const HelpEmbeded3 = new Discord.richEmbed()
            .setColor('#e01010')
            .setTitle("It's time to play blackjack!")
            .setAuthor("tbh I don't know who")
            .setDescription('What will happen now!')
            .addFields(
                { name: '&blackjack hit', value: 'Get another card!' },
                { name: '&blackjack stand', value: "Stop getting cards for the round!" },
                { name: "&blackjack quit", value: 'Quit the game :(' },
                { name: "&blackjack join", value: "Join the game!" }
            )
            .setTimestamp()
            .setFooter('What are you searching for down here?');
        msg.channel.send(HelpEmbeded3);
    }
    var i;
    if (args[0] == 'join') {
        msg.channel.send('Success?');
    }
}

module.exports.help = {
    name: "blackjack"
}