module.exports.run = async (bot, msg, args, db, UserId) => {
    const ms = require('ms');

    var OwnerId;

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            OwnerId = q.data().guildOwnerId;
        }
    })
    if (UserId === OwnerId || UserId === '430722923419009024') {
        if (msg.member.hasPermission('MANAGE_MESSAGES')) {
            var member = msg.guild.member(msg.mentions.users.first() || msg.guild.members.cache.get(args[0]));
            if (!member) return msg.reply('Please Provide a Member to TempMute.')

            let role = msg.guild.roles.cache.find(role => role.name === "Muted");

            if (!role) return msg.reply("Couldn't find the 'muted' role.")

            let time = args[1];
            if (!time) {
                return msg.reply("You didnt specify a time!");
            }

            member.roles.add(role.id);

            msg.channel.send(`@${member.user.tag} has now been muted for ${ms(ms(time))}`)

            setTimeout(function () {
                member.roles.remove(role.id);
                msg.channel.send(`@${member.user.tag} has been unmuted.`)
            }, ms(time));

        } else {
            return msg.channel.send('You dont have perms.')
        }
    } else {
    return msg.channel.send("You don't have right permissions for this!")
}

module.exports.help = {
    name: 'tempmute'
}