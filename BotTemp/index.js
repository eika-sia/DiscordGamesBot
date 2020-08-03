const Discord = require('discord.js');
const { prefix } = require('./config.json');
const client = new Discord.Client();
const fs= require('fs');
const blackjack = require('./commands2/blackjack');

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands2').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands2/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('We are in boys!');
	client.user.setActivity("&help");
});

//TO DO LIST:
//blackjack/poker

//When there is a new message start something if starts with Prefix
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;


	//Get args and command
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	
	if (!client.commands.has(command)) return;


	//Run the file nammed "command"
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

//Logins
client.login();