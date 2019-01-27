const Discord = require('discord.js');
const client = new Discord.Client();
var auth = require('./auth.json');


client.on('ready', () => {
	console.log("Connected as " + client.user.tag);

	client.user.setActivity('Op Ida Daily Update');

	client.guilds.forEach((guild) => {
		console.log(guild.name);
	});
});

client.on('message', function (msg) {
	//Prevents botception, also known as a bot spamming loop.
	if(message.author.bot) return;

	if (msg.content.indexOf('!ping') === 0) {
		bot.sendMessage(msg.channel, 'Pong!');

		console.log('pong-ed ' + msg.author.username);
	}

});

client.login(auth.token);