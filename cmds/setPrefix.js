module.exports.run = async(bot, msg, args,db) => {
    var argsF = new Array();
    argsF= args;

    if (argsF.length === 0) {
        msg.channel.send('Missing the prefix!');
    } else if (argsF.length === 1) {
        let newPrefix = args[0];

        db.collection('guilds').doc(msg.guild.id).update({
            'prefix' : newPrefix
        }).then(() => {
            msg.channel.send(`[prefix update]: new prefix ${newPrefix}`);
        });
    }
}

module.exports.help = {
    name: 'setPrefix'
}