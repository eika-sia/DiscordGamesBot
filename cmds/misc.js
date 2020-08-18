module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            prefix = q.data().prefix;
        }
    }).then(() => {
        const HelpEmbeded2 = new Discord.MessageEmbed()
            .setColor('#20e395')
            .setTitle('Misc commands!')
            .setAuthor('Totally not your developer')
            .setDescription('What fun things to do!')
            .addFields(
                { name: `${prefix}misc`, value: 'Opens this 2nd nicely made card' },
                { name: `${prefix}bar`, value: "Bar!" },
                { name: `${prefix}mafs`, value: 'Tru equation!' },
                { name: `${prefix}blackjack`, value: "Game of Blackjack!" },
                { name:`${prefix}meme`, value: "Generates a meme from reddit!" },
                { name:`${prefix}Sokoban`, value: "Starts a game of sokoban!" },
                { name: `${prefix}snake`, value: "start the snake games help!"}
            )
            .setTimestamp()
            .setFooter('What are you searching for down here?');
        msg.channel.send(HelpEmbeded2);
    })
}

module.exports.help = {
    name: "misc"
}