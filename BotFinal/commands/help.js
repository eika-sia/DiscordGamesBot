module.exports = {
	name: 'help',
	description: 'Help command!',
	execute(message, args) {
        const Discord = require('discord.js');
        const HelpEmbeded = new Discord.MessageEmbed()
        .setColor('#49f2f5')
        .setTitle('Help Card!')
        .setAuthor('Your developer')
        .setDescription('How to use this simple bot!')
        .addFields(
            { name: '&help', value: 'Opens this nicely made card' },
            { name: '&gradient', value: "Returns a command for a gradient with hex codes, it is useful for gradients with formating because the rgb ones don't work. Usage is: &gradient [hex code 1] [word] [hex code 2] [bold/undeline/italic]. last  input is for formating! *leave empty if you don't want formating!"},
            { name: "&misc", value: 'Send a card explaining misc commands!'}
        )
        .setTimestamp()
        .setFooter('What are you searching for down here?');
        message.channel.send(HelpEmbeded);
	},
};