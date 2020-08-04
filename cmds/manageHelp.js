module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');
    const HelpEmbeded4 = new Discord.MessageEmbed()
        .setColor('#3e34cf')
        .setTitle('This are commands server owners can perform!')
        .setAuthor('The guy writing this')
        .addFields(
            { name: '&prune', value: 'Bulk delete, use &prune [number]' },
            { name: '&gradient', value: "Set the prefix, &setPrefix [new prefix, can be anything]"},
        )
        .setTimestamp()
        .setFooter('Really you are searching for stuff down here again?');
        msg.channel.send(HelpEmbeded4);
}

module.exports.help = {
    name : "manageHelp"
}