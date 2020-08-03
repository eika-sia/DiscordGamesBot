module.exports = {
	name: 'bar',
	description: 'Returns Bar!',
	execute(message, args) {
		if (message.member=='479346286730936330') {
			message.channel.send('nub');
		} else
			message.channel.send("Bar Rank!");
	},
};