module.exports.run = async (bot, msg, args, db, UserId) => {
    const ms = require('ms');
    let OwnerId;

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            OwnerId = q.data().guildOwnerID;
        }
    }).then(() => {

        if (UserId === OwnerId || UserId === '430722923419009024') {
            if (msg.member.hasPermission('MANAGE_MESSAGES')) {
                var member = msg.guild.member(msg.mentions.users.first() || msg.guild.members.cache.get(args[1]));
                if (!member) return msg.reply('Please Provide a Member to TempMute.')

                let role = msg.guild.roles.cache.find(role => role.name === "Muted");

                if (!role) return msg.reply("Couldn't find the 'Muted' role.")
                let time = args[0];
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
    })
}

module.exports.help = {
    name: 'tempmute'
}