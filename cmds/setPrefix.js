module.exports.run = async (bot, msg, args, db, UserId) => {
    var argsF = new Array();
    argsF = args;

    let OwnerId;

    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            OwnerId = q.data().guildOwnerID;
        }
    }).then(() => {
        if (UserId === OwnerId || UserId === '430722923419009024') {
            if (argsF.length === 0) {
                msg.channel.send('Missing the prefix!');
            } else if (argsF.length === 1) {
                let newPrefix = args[0];

                if (newPrefix.length < 3) {

                    db.collection('guilds').doc(msg.guild.id).update({
                        'prefix': newPrefix
                    }).then(() => {
                        msg.channel.send(`[prefix update]: new prefix ${newPrefix}`);
                    });
                } else {
                    msg.channel.send('Your prefix is too long!')
                }
            }
        } else { msg.channel.send("Do you have right permissions?"); }
    })
}
module.exports.help = {
    name: 'setPrefix'
}