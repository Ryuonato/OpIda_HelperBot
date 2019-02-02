const Discord = require('discord.js');
const client = new Discord.Client();
var auth = require('./auth.json');
var date = new Date().toUTCString();

client.on('ready', () => {
	console.log("Connected as " + client.user.tag);

	client.user.setActivity('Op Ida Daily Update');

	client.guilds.forEach((guild) => {
		console.log(guild.name);
	});
	console.log (date);
});

client.on('message', msg => {
	
	if (msg.content === '!ping') {
		msg.reply('Pong!');

		console.log('pong-ed ' + msg.author.username + ' ' +  date);
	}

	if (msg.content === '!pong') {
		msg.reply('Ping!');

		console.log('ping-ed ' + msg.author.username + ' ' + date);
	}

});

client.login(auth.discordToken);