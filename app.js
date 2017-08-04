const Discord = require('discord.js');
const request = require('request');
const client = new Discord.Client();
const token = '***REMOVED***';

let username = "";

client.on("ready", () => {
    console.log('I am ready!');
});

client.on("message", message =>{
    if(message.channel.type === 'dm') {
        if(!message.author.bot) {
            username = message.content;
            console.log(`username : ${username}`);
            request.post({
                url: "http://localhost/mybb/inc/plugins/minecraftforgefrance.php",
                form: {
                    username: message.content
                }
            }, function(error, response, body){
                console.log(body);
            });
            message.channel.send("Votre message a bien été reçu, il sera traité dès que possible.")
                .then(async message => console.log(`Send message: ${message.content}`))
                .catch(console.error());
        }
    }
});

client.on("guildMemberAdd", member => {
    member.send("Bonjour, " + member.displayName + "\nMerci de m\'indiquer votre pseudo sur le forum.")
        .then(async (message) => console.log(`Sent message: ${message.content}`))
        .catch(console.error());
});

client.login(token);