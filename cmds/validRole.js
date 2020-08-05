let Discord = require('discord.js');
let FieldValue = require('firebase-admin').firestore.FieldValue;

module.exports.run = async (bot, msg, args, db, argsLenght) => {

    var argsF = new Array();
    argsF = args;

    let reply = new Discord.RichEmbed()
        .setColor('#eb952d')
        .setAuthor('Google')
        .setTimestamp(new Date())
        .setFooter('Still nothing down here!');

    if (argsF.length === 0) {
        reply.addField("{prefix}validRole @rolename", '\u200b')
        msg.channel.send(reply);
    } else if (argsF.length === 1) {
        var args0 = argsF[0];
        let role_id = argsF[0].substring(3, args0.length - 1);
        let added = false;

        msg.guild.roles.forEach(elem => {
            let server_role = String(elem);
            let tmp = server_role.substring(3, server_role.length - 1);
            if (tmp === role_id) {
                db.collection('roles').doc(msg.guild.id).update({
                    'role_id': FieldValue.arrayUnion(role_id)
                }).then(() => {
                    reply.addField("Valid entry!", `${args[0]} has access to the bot commands!`);
                    msg.channel.send(reply);
                    added = true;
                });
            }
        });

        setTimeout(() => {
            if (!added) {
                reply.addField("Role not found!", "The role has to exsist on the server!");
                msg.channel.send(reply);
            }
        }, 2000)


    }
}
module.exports.help = {
    name: "validRole"
}