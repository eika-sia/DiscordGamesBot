module.exports = {
	name: 'blackjack',
	description: 'Did you ever want to play blackjack',
	execute(message, args) {
        const Discord = require('discord.js');
        const { PlayersJoined } = require('./blackjack.json');
        const fs = require('fs');

        //Reading JSON file for data saving
        var bjJSON = require('./blackjack.json');
        console.log(bjJSON);



        if (args[0] == 'create' && bjJSON.GameStart==false) {
            GameStart=false;
            players = args[1];
            const HelpEmbeded3 = new Discord.MessageEmbed()
            .setColor('#e01010')
            .setTitle("It's time to play blackjack!")
            .setAuthor("tbh I don't know who")
            .setDescription('What will happen now!')
            .addFields(
                { name: '&blackjack hit', value: 'Get another card!' },
                { name: '&blackjack stand', value: "Stop getting cards for the round!"},
                { name: "&blackjack quit", value: 'Quit the game :('},
                { name: "&blackjack join", value: "Join the game!"}
            )
            .setTimestamp()
            .setFooter('What are you searching for down here?');
            message.channel.send(HelpEmbeded3);
            bjJSON.GameStart = true;
            bjJSON = JSON.stringify(bjJSON, null, 2);
            console.log(bjJSON);
            fs.writeFileSync('blackjack.json', bjJSON);
        }
        var i;
        if (args[0] == 'join') {
            console.log(GameStart);
            message.channel.send('Success?');
        }
        
	}
};