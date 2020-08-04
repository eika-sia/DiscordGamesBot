module.exports.run = async (bot, msg, args, db) => {
		if (msg.member=='479346286730936330') {
			msg.channel.send('nub');
		} else
			msg.channel.send("Bar Rank!");
};

module.exports.help = {
    name: "bar"
}