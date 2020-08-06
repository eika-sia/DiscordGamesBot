module.exports.run = async (bot, msg, args, db) => {
    const Discord = require('discord.js');

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            prefix = q.data().prefix;
        }
    }).then(() => {
        const HelpEmbeded4 = new Discord.MessageEmbed()
            .setColor('#3e34cf')
            .setTitle('This are commands server owners can perform!')
            .setAuthor('The guy writing this')
            .addFields(
                { name: `${preifx}prune [n of msgs]`, value: 'Bulk delete' },
                { name: `${preifx}setPrefix [new prefix, can be anything]`, value: "Set the prefix" },
                { name: `${preifx}test`, value: "Doesn't really do anything except returns success if the bot is online" },
                { name: `${preifx}tempmute [time] [@{member}]`, value: "Will temporarly mute a member" }
            )
            .setTimestamp()
            .setFooter('Really you are searching for stuff down here again?');
        msg.channel.send(HelpEmbeded4);
    })
}

module.exports.help = {
    name: "manageHelp"
}