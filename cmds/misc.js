module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');
    const HelpEmbeded2 = new Discord.MessageEmbed()
        .setColor('#20e395')
        .setTitle('Misc commands!')
        .setAuthor('Totally not your developer')
        .setDescription('What fun things to do!')
        .addFields(
            { name: '&misc', value: 'Opens this 2nd nicely made card' },
            { name: '&bar', value: "Bar!" },
            { name: "&mafs", value: 'Tru equation!' },
            { name: "blackjack", value: "Game of Blackjack! &blackjack Create [number of players (1-3)] to start the game" },
            {name: "&meme", value: "Generates a meme from reddit!"}
        )
        .setTimestamp()
        .setFooter('What are you searching for down here?');
    msg.channel.send(HelpEmbeded2);
}

module.exports.help = {
    name: "misc"
}