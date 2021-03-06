const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ms = require("ms");
const bot = new Discord.Client();
const fs = require("fs");

// This is a temporary bot. It will only be used on the Kevlar Discord Server.

bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);

    let jsFile = files.filter(f => f.split(".").pop() === "js")

    if (jsFile.length <= 0 ) {
        console.log("Couldn't find commands.");
        return;
    }

    jsFile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} Loaded.`);

        bot.commands.set(props.help.name, props);
    });
})

const token = process.env.BOT_TOKEN; // You actually thought I would leak this?

prefix = "!";

queue = [];

bot.login(token);

function play(connection, message) {
    server = message.guild.id;
    server.dispatcher = connection.playStream(ytdl(queue[0], {filter: "audioonly"}));
    queue.shift();
    server.dispatcher.on("end", function() {
        if (queue[0]) play(connection, message);
        else connection.disconnect();
    });
};

bot.on("ready", function() {
    bot.user.setActivity("Use !help for help.");
});

bot.on("message", (message) => {
    if (message.content.startsWith(prefix)) {

        var args = message.content.substring(prefix.length).split(" ");

        if (message.author.id !== "249691473820385281") {
            return; // This is a private bot only to be used by @TheCow#8526.
        }

        let commandfile = bot.commands.get(message.content.slice(prefix.length));
        if (commandfile) commandfile.run(bot, message, args);

        switch (args[0].toLowerCase()) {
            case "help":
                break;
            case "play":
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
                break;
            case "skip":
                var server = message.guild.id;
                if (server.dispatcher) server.dispatcher.end();
                break
            case "stop":
                var server = message.guild.id;
                if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
                break;
            case "kick":
                if(message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to kick.").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention one user.")
                }
                let kickMember = message.guild.member(message.mentions.users.first());
                if(!kickMember) {
                    return message.reply("That user doesn't exist.");
                }
                if(!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
                    return message.reply("I don't have permissions to execute the command.").catch(console.error);
                }
                kickMember.kick().then(function(member) {
                    message.reply(`${member.user.username} was succesfully kicked.`).catch(console.error);
                }).catch(console.error)
                break;
            case "ban":
                if(message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to ban.").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention one user.")
                }
                let banMember = message.guild.member(message.mentions.users.first());
                if(!banMember) {
                    return message.reply("That user doesn't exist.");
                }
                if(!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) {
                    return message.reply("I don't have permissions to execute the command.").catch(console.error);
                }
                banMember.ban().then(function(member) {
                    message.reply(`${member.user.username} was succesfully banned.`).catch(console.error);
                }).catch(console.error)
                break;
            case "mute":
                if (message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to mute.").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention one user.")
                }
                if (!args[2]) {
                    return message.reply("Please specify a time in seconds for how long you want the user to be muted.");
                }
                var muteMember = message.guild.member(message.mentions.users.first());
                const muteRole = message.guild.roles.find("name", "Muted");
                muteMember.addRole(muteRole.id);
                message.reply(`HAHAHAH! ${muteMember.displayName} has been muted for ${ms(args[2])} seconds.`);
                setTimeout(function() {
                    muteMember.removeRole(muteRole.id);
                    message.channel.send(`@${muteMember.user.tag} has been unmuted.`);
                }, ms(args[2] + "s"));
                break;
            default:
                message.reply("That's not a command.");
                break;
        }
    }
});
