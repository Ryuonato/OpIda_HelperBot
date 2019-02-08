'use strict';
//googleapis constants
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
//discord constants
const Discord = require('discord.js');
const client = new Discord.Client();
//variables
var discordauth = require('./auth.json');
var date = new Date().toUTCString();
var currentHour = new Date().getUTCHours();
var dailyMessage = "";
var resetMessage = "12h update for ";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

client.on('ready', () => {
console.log("Connected as " + client.user.tag);

client.user.setActivity('Compiling OpIda Update...');

client.guilds.forEach((guild) => {
console.log(guild.name);
});
console.log (date);
});

client.on('message', msg => {
	
	if(msg.author.bot) return;
	
	if(msg.content.indexOf(discordauth.prefix) !== 0) return;

	const args = msg.content.slice(discordauth.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command === "ping") {
		msg.reply('Pong!');
		console.log('pong-ed ' + msg.author.username + ' ' +  date);
	}

	if (command === "pong") {
		msg.reply('Ping!');
		console.log('ping-ed ' + msg.author.username + ' ' + date);
	}

	if (command === "update") {
		msg.delete();
		if (!msg.member.roles.some(r=>["Administrator", "Coordinator"].includes(r.name))) {
			return msg.reply("Sorry, you don't have permissions to use that!").then((msg) => {msg.delete(6000)});
			console.log(msg.author.username + 'requested an !update command');
		} else if (msg.channel.name !== "daily-update") {
			return msg.reply("Sorry, this isn't the correct channel for that!").then((msg) =>{msg.delete(6000)});
			console.log(msg.author.username + 'requested an !update command in ' +msg.channel.name)
		}
		date = new Date().toUTCString();
		currentHour = new Date().getUTCHours();
		console.log(date);
		console.log(currentHour);
		msg.channel.send('Preparing update message...').then((msg) =>{
			msg.delete(6000);
		});
		dailyMessage = resetMessage;
		console.log(msg.author.username + ' requested update at ' + date);
		beginUpdate();

	}

});

function beginUpdate() {
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
if (err) return console.log('Error loading client secret file:', err);
// Authorize a client with credentials, then call the Google Sheets API.
//authorize(JSON.parse(content), pullMilestoneData);
//authorize(JSON.parse(content), pullTotalsData);
authorize(JSON.parse(content), pullCommodityData);
})

/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
const {client_secret, client_id, redirect_uris} = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
client_id, client_secret, redirect_uris[0]);

// Check if we have previously stored a token.
fs.readFile(TOKEN_PATH, (err, token) => {
if (err) return getNewToken(oAuth2Client, callback);
oAuth2Client.setCredentials(JSON.parse(token));
callback(oAuth2Client);
});
};

/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback for the authorized client.
*/
function getNewToken(oAuth2Client, callback) {
const authUrl = oAuth2Client.generateAuthUrl({
access_type: 'offline',
scope: SCOPES,
});
console.log('Authorize this app by visiting this url:', authUrl);
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});
rl.question('Enter the code from that page here: ', (code) => {
rl.close();
oAuth2Client.getToken(code, (err, token) => {
if (err) return console.error('Error while trying to retrieve access token', err);
oAuth2Client.setCredentials(token);
// Store the token to disk for later program executions
fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
if (err) console.error(err);
console.log('Token stored to', TOKEN_PATH);
});
callback(oAuth2Client);
});
});
};

/**
* Prints the names and majors of students in a sample spreadsheet:
* @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
* @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
*/
function pullCommodityData(auth) {
const sheets = google.sheets({version: 'v4', auth});

sheets.spreadsheets.values.get({
spreadsheetId: discordauth.googleSheetsID,
range: discordauth.googleSheetName + '!B2',
}, (err, res) => {
	if (err) return console.log('The API returned an error: ' + err);
const rows = res.data.values;
console.log("Adding Station to Update Message...")
	if (rows.length) {
		rows.map((row) => {
	dailyMessage = dailyMessage + `${row[0]}` + "\n" + "\n" + "**HAUL:**\n";
})
}
});

sheets.spreadsheets.values.get({
spreadsheetId: discordauth.googleSheetsID,
range: discordauth.googleSheetName + '!B7:G21',
}, (err, res) => {
if (err) return console.log('The API returned an error: ' + err);
const rows = res.data.values;
if (rows.length) {
console.log('Begining Daily Message Compile...');
// Print columns A and E, which correspond to indices 0 and 4.
rows.map((row) => {
if (row[3] === '100') {
//console.log(`${row[0]} ` + 'is completed.');
} else {
//console.log('Compiling Commodity...');
//console.log(`${row[0]} ${row[5]} ${row[6]} ${row[8]}`);
dailyMessage = dailyMessage + `${row[0]}` + '\n';
//console.log('Row Completed!');               
}
});
} else {
console.log('No data found.');
}
pullTotalsData(auth);
}
);

};

function pullTotalsData(auth) {
const sheets = google.sheets({version: 'v4', auth});
sheets.spreadsheets.values.get({
spreadsheetId: discordauth.googleSheetsID,
range: discordauth.googleSheetName + '!B4',
}, (err, res) => {
if (err) return console.log('The API returned an error: ' + err);
const rows = res.data.values;
if (rows.length) {
//console.log('Commodity, Total Delivered, Required, Delta:');
// Print columns A and E, which correspond to indices 0 and 4.
rows.map((row) => {
//console.log('Compiling Totals...');
//console.log('Overall: ' +`${row[1]} ${row[3]}`);
dailyMessage = dailyMessage + '\n' +`${row[0]}` + '\n';
//console.log('Row Completed!');               
});
} else {
console.log('No data found.');
}
pullMilestoneData(auth);
})
};

function pullMilestoneData(auth) {
const sheets = google.sheets({version: 'v4', auth});
sheets.spreadsheets.values.get({
spreadsheetId: discordauth.googleSheetsID,
range: discordauth.googleSheetName + '!B5',
}, (err, res) => {
if (err) return console.log('The API returned an error: ' + err);
const rows = res.data.values;
if (rows.length) {
//console.log('Commodity, Total Delivered, Required, Delta:');
// Print columns A and E, which correspond to indices 0 and 4.
rows.map((row) => {
//console.log('Compiling Milestones...');
dailyMessage = dailyMessage + `${row[0]}` + '\n';
});
} else {
console.log('No data found.');
};
console.log('Compile Completed...');
replyUpdate();
});
};
};

function replyUpdate() {
console.log("I am checking to see if it is time...");
console.log("Current UTC Hour: " + currentHour);
var guild = client.guilds.get(discordauth.discordGuildId);
var channel = guild.channels.get(discordauth.discordChannelId);
console.log(guild.id);
console.log(channel.id);
if(currentHour === 7 || currentHour === 19 ) {
if((guild.id === discordauth.discordGuildId) && (channel.id === discordauth.discordChannelId)){
channel.send(dailyMessage)
console.log("Completed Update.");
} else {
console.log("nope");
};
} else {
console.log("Not correct time to post!")
channel.send("It isn't time for an update yet!").then((msg) =>{
msg.delete(8000)});
};
};

client.login(discordauth.discordToken);

//Uncomment for Debugging...
/*client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));*/
