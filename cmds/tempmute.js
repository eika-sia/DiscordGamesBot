module.exports.run = async (bot, msg, args, db, UserId) => {
    const ms = require('ms');
    
    if(msg.member.hasPermission('MANAGE_msgS')) {
        var member = msg.guild.member(msg.mentions.users.first() || msg.guild.members.cache.get(args[0]));
        if(!member) return msg.reply('Please Provide a Member to TempMute.')

        let role = msg.guild.roles.cache.find(role => role.name === "Muted");

        if (!role) return msg.reply("Couldn't find the 'muted' role.")

        let time = args[1];
        if (!time) {
            return msg.reply("You didnt specify a time!");
        }

        member.roles.add(role.id);

        msg.channel.send(`@${member.user.tag} has now been muted for ${ms(ms(time))}`)

        setTimeout( function () {
            member.roles.add(mainrole.id)
            member.roles.remove(role.id);
            msg.channel.send(`@${member.user.tag} has been unmuted.`)
        }, ms(time));

    } else {
        return msg.channel.send('You dont have perms.')
    }
}

module.exports.help = {
    name: 'tempmute'
}