module.exports = {
	name: 'prune',
	description: 'Bulk delete',
	execute(message, args) {
        if(message.member==430722923419009024) {
			const amount = parseInt(args[0]) + 1;

			if (isNaN(amount)) {
				return message.reply('that doesn\'t seem to be a valid number.');
			} else if (amount <= 1 || amount > 100) {
				return message.reply('you need to input a number between 1 and 99.');
			}

			message.channel.bulkDelete(amount, true).catch(err => {
				console.error(err);
				message.channel.send('there was an error trying to prune messages in this channel!');
			});} else {message.channel.send("You don't have right permissions for this!")}
	},
};