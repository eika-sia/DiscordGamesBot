module.exports.run = async (bot, msg, args, db) => {
    msg.channel.send('Success!');

    if (message.guild.me.hasPermission("MUTE_MEMBERS")) {
        msg.channel.send('True!')
    }
}

module.exports.help = {
    name: "test"
}