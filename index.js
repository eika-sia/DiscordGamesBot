
// require packages
const Discord = require('discord.js');
const fs = require('fs');
const got = require('got');
require('dotenv/config');

// initialise are bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

//import settings
let prefix;
const owner = process.env.OWNER;

//initalise database (Firabase!)

const Firebase = require('firebase/app');
const FieldValue = require('firebase-admin/').firestore.FieldValue;
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


//read commands files
fs.readdir('./cmds', (err, files) => {
    if (err) {
        console.log(err);
    }

    let cmdFiles = files.filter(f => f.split(".").pop() === "js");

    if (cmdFiles.length === 0) {
        console.log("No files found");
        return;
    }

    cmdFiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded`);
        bot.commands.set(props.help.name, props);
    })
})





bot.on('ready', async () => {
    console.log("Hello, im ready");

});


bot.on('message', msg => {
    db.collection('guilds').doc(msg.guild.id).get().then((q) => {
        if (q.exists) {
            prefix = q.data().prefix
        }
    }).then(() => {
        if (msg.channel.type === "dm") return;
        if (msg.author.bot) return;

        let msg_array = msg.content.split(" ");
        let command = msg_array[0];
        let args = msg_array.slice(1);

        if (!command.startsWith(prefix)) return;

        if (bot.commands.get(command.slice(prefix.length))) {
            db.collection('guilds').doc(msg.guild.id).get().then((q) => {
                if (q.exists) {
                    if (q.data().guildOwnerID === msg.author.id) {
                        let cmd = bot.commands.get(command.slice(prefix.length));
                        if (cmd) {
                            let UserId = msg.author.id;
                            cmd.run(bot, msg, args, db, UserId).then(() => {
                                console.log('Owner used a commad!');
                            });
                        }
                    } else {
                        let allowed = false;
                        db.collection('roles').doc(msg.guild.id).get().then((r) => {
                            for (var i = 0; i < r.data().role_id.length; i++) {
                                msg.member.roles.role_id.forEach((uRole) => {
                                    let tmp_role = String(uRole);
                                    tmp_role = tmp_role.substring(3, tmp_role.length - 1);
                                    if (tmp_role === r.data.role_id[i]) {
                                        let cmd = bot.commands.get(command.slice(prefix.length));
                                        if (cmd) {
                                            let UserId = msg.author.id;
                                            cmd.run(bot, msg, args, db, UserId).then(() => {
                                                allowed = true;
                                                console.log("Valid user command!");
                                            }).catch((err) => {
                                                console.log(err);
                                            })
                                        }
                                    }
                                })
                            }
                        }).then(() => {
                            if (!allowed) {
                                let cmd = bot.commands.get(command.slice(prefix.length));
                                if (cmd) {
                                    let UserId = msg.author.id;
                                    cmd.run(bot, msg, args, db, UserId).then(() => {
                                        allowed = true;
                                        console.log("Valid user command!");
                                    }).catch((err) => {
                                        console.log(err);
                                    })
                                }
                            }
                        })
                    }
                }
            })

        }

    })

});

bot.on('guildCreate', async gData => {
    db.collection('guilds').doc(gData.id).set({
        'guildID': gData.id,
        'guildName': gData.name,
        'guildOwner': gData.owner.user.username,
        'guildOwnerID': gData.owner.id,
        'guildMemberCount': gData.memberCount,
        'prefix': '&'
    });

    db.collection('roles').doc(gData.id).set({
        role_id: []
    })
});

// Bot login
bot.login("NzM4NjkzODQ5MDUxODI0MTYw.XyPoQQ.cvOSARj51IG-vKLGjxHdGA6QcPU");
