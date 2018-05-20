const Discord = require("discord.js");
const ytdl = require("ytdl-core");

function play(connection, message) {
    server = message.guild.id;
    server.dispatcher = connection.playStream(ytdl(queue[0], {filter: "audioonly"}));
    queue.shift();
    server.dispatcher.on("end", function() {
        if (queue[0]) play(connection, message);
        else connection.disconnect();
    });
};

module.exports.run = async(bot, message, args) => {
    console.log("wasd");
	if (!args[1]) {
        message.reply("Please provide a YouTube video link.");
        return;
    }
    console.log(message.member.name);
    if (!message.member.voiceChannel) {
        message.reply("Please enter the Voice Channel you want the video to be played in.");
        return;
    }
    queue.push(args[1]);
    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        console.log("wesdio");
        play(connection, message);
    });
}

module.exports.help = {
	name: "play"
}