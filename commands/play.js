const Discord = require("discord.js");

module.exports.run = async(bot, message, args) => {
    console.log("wasd");
	if (!args[1]) {
        message.reply("Please provide a YouTube video link.");
        return;
    }
    if (!message.member.voiceChannel) {
        message.reply("Please enter the Voice Channel you want the video to be played in.");
        return;
    }
    queue.push(args[1]);
    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message);
    });
}

module.exports.help = {
	
}