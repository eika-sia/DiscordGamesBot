
module.exports.run = async (bot, msg, args, db) => {

	var argsF = new Array();
	argsF = args;

	if (args.length == 3) { msg.channel.send("/rename <$" + args[0] + ">" + args[1] + "<$" + args[2] + ">"); } else {
		var word = args[1];
		var i;
		var PalArray = new Array();
		PalArray.push(blend_colors(args[0], args[2]));
		PalArray.push(blend_colors(args[0], args[2]));

		if (word.length % 2 == 1) {
			for (i = 0; i < (word.length - 3) / 2; i++) {
				PalArray.unshift(blend_colors(args[0], PalArray[0]));
			}
			for (i = 0; i < (word.length - 3) / 2; i++) {
				PalArray.push(blend_colors(args[2], PalArray[PalArray.length - 1]));
			}
		} else {
			for (i = 0; i < (word.length - 4) / 2; i++) {
				PalArray.unshift(blend_colors(args[0], PalArray[0]));
			}
			for (i = 0; i < (word.length - 4) / 2; i++) {
				PalArray.push(blend_colors(args[2], PalArray[PalArray.length - 1]));
			}
		}

		PalArray.unshift(args[0]);
		PalArray.push(args[2]);

		var Bold;
		var italic;
		var undeline;
		if (args.length == 4) {
			if (args[3] == 'bold') {
				Bold = true;
			} else if (args[3] == 'underline') {
				undeline = true;
			} if (args[3] == 'italic') {
				italic = true;
			}
		}

		for (i = 0; i < PalArray.length; i++) {
			var TempVar = PalArray[i];
			TempVar = TempVar.substring(1);
			TempVar = "&x&" + TempVar[0] + "&" + TempVar[1] + "&" + TempVar[2] + "&" + TempVar[3] + "&" + TempVar[4] + "&" + TempVar[5];
			if (Bold) { TempVar = TempVar + '&l'; }
			if (undeline) { TempVar = TempVar + '&n'; }
			if (italic) { TempVar = TempVar + '&o'; }
			TempVar = TempVar + word[i];
			PalArray[i] = TempVar;
		}
		PalArray.pop(PalArray.length-1)
		console.log(PalArray);
		var CommandFinal = '/rename ';
		for (i = 0; i < PalArray.length; i++) {
			CommandFinal = CommandFinal + PalArray[i];
		}

		msg.channel.send(CommandFinal);

		function blend_colors(color1, color2) {
			// check input
			color1 = color1 || '#000000';
			color2 = color2 || '#ffffff';

			// 1: validate input, make sure we have provided a valid hex
			if (color1.length != 4 && color1.length != 7)
				msg.channel.send('colors must be provided as hexes');

			if (color2.length != 4 && color2.length != 7)
				msg.channel.send('colors must be provided as hexes');



			// 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
			//      the three character hex is just a representation of the 6 hex where each character is repeated
			//      ie: #060 => #006600 (green)
			if (color1.length == 4)
				color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
			else
				color1 = color1.substring(1);
			if (color2.length == 4)
				color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
			else
				color2 = color2.substring(1);

			console.log('valid: c1 => ' + color1 + ', c2 => ' + color2);

			// 3: we have valid input, convert colors to rgb
			color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
			color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

			console.log('hex -> rgba: c1 => [' + color1.join(', ') + '], c2 => [' + color2.join(', ') + ']');

			// 4: blend
			var percentage = 0.5;
			var color3 = [
				(1 - percentage) * color1[0] + percentage * color2[0],
				(1 - percentage) * color1[1] + percentage * color2[1],
				(1 - percentage) * color1[2] + percentage * color2[2]
			];

			console.log('c3 => [' + color3.join(', ') + ']');

			// 5: convert to hex
			color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

			console.log(color3);
			// return hex
			return color3;
		}

		/*
		convert a Number to a two character hex string
		must round, or we will end up with more digits than expected (2)
		note: can also result in single digit, which will need to be padded with a 0 to the left
		@param: num         => the number to conver to hex
		@returns: string    => the hex representation of the provided number
		*/
		function int_to_hex(num) {
			var hex = Math.round(num).toString(16);
			if (hex.length == 1)
				hex = '0' + hex;
			return hex;
		}

	}
}

module.exports.help = {
	name: "gradient"
}