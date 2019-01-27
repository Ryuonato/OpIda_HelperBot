const Discord = require('discord.js')
var auth = require('./auth.json')
const client = new Discord.Client()

client.on('ready', () => {
	console.log("Connected as " + client.user.tag)

	client.user.setActivity("Op Ida Daily Update")

	client.guilds.forEach((guild) => {
		console.log(guild.name)
	})
})

client.login(auth.token)