const NoMoreFortnite = require('discord.js');
const client = new NoMoreFortnite.Client({ intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING', 'GUILDS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INTEGRATIONS', 'GUILD_INVITES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES', 'GUILD_WEBHOOKS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.config = require('./config.js');
const ms = require('ms');

const { createConnection } = require('mysql');
const con = createConnection(client.config.mysql);
try {
    con.connect(err => {
        if (err) {
            setTimeout(() => {
                console.log(`\nAn error has occured when attempting to connect to your MySQL Database...\nERROR:\n\n${err}`);
                process.exit();
            }, 4000)
        } else {
            setTimeout(() => {
                console.log(`MySQL has been connected to ${client.config.mysql.database}`);
            }, 4000)
        }
    });
} catch (e) {
    console.log(e);
}

client.on('ready', async (client) => {

    setInterval(function () {
        con.ping()
    }, ms(`25m`));

    console.log(`${client.user.tag} is now online!`);
    setTimeout(() => {
        console.log(`${client.guilds.cache.size} guild(s) are now being protected!!!`);
    }, 2000)

    client.user.setPresence({
        activities: [{
            name: 'Fortnite Kids',
            type: 'WATCHING'
        }],
        status: 'dnd'
    });

    client.guilds.cache.forEach(async g => {
        await con.query(`SELECT * FROM guilds WHERE guildid='${g.id}'`, async (err, row) => {
            if (err) throw err;
            if (!row[0]) {
                await con.query(`INSERT INTO guilds (guildid, toggled, bans, kicks) VALUES ('${g.id}', 'true', 'false', 'false')`, async (err, row) => { });
            }
        });
    });
});

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'DM') return;
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('fortnite')) {
        await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}' AND toggled='true'`, async (err, row) => {
            if (err) throw err;
            let lolxd = row[0];
            if (lolxd) {
                await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}' AND bans='true'`, async (err, row) => {
                    if (err) throw err;
                    let uh = row[0];
                    if (uh) {
                        const user = message.member;

                        user.ban(`No. More. fOrTnItE!!! 🤡`).catch(e => { });
                        await message.channel.send({ content: "LOL kid got banned 🤡!! Make sure no fortnite is seen here..." }).catch(e => { });
                    }
                });
                await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}' AND kicks='true'`, async (err, row) => {
                    if (err) throw err;
                    let uhh = row[0];
                    if (uhh) {
                        const user = message.member;

                        user.kick(`No. More. fOrTnItE!!! 🤡`).catch(e => { });
                        await message.channel.send({ content: "LOL kid got kicked 🤡!! Make sure no fortnite is seen here..." }).catch(e => { });
                    }
                });
                await message.delete().catch(e => { });
                await message.channel.send({ content: "No. More. fOrTnItE!!! 🤡" }).catch(e => { });
            }
        });
    }

    if (message.content.toLowerCase() === `${client.config.prefix}help`) {
        const helpMenu = new NoMoreFortnite.MessageEmbed()
            .setTitle(`${client.user.username} Help Menu`)
            .setDescription("**Commands**\n`toggleguild` - Toggle on or off the bot for this guild\n`togglebans` - Toggle on or off the bot to ban fortnite kids\n`togglekicks` - Toggle on or off the bot to kick fortnite kids\n`credits` - See the credits of the bot\n`invite` - Invite the bot to your guild")
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("#FFFFFF")
            .setFooter("Made by Synapse#0100");
        await message.channel.send({ embeds: [helpMenu] }).catch(e => { });
    } else if (message.content.toLowerCase() === `${client.config.prefix}toggleguild`) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send({ embeds: [new NoMoreFortnite.MessageEmbed().setDescription("You are missing the \`ADMINISTRATOR\` permission to use this command!").setColor("#FFFFFF")] }).catch(e => { });
        await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}'`, async (err, row) => {
            if (err) throw err;
            if (row[0]) {
                if (row[0].toggled === 'false') {
                    await con.query(`UPDATE guilds SET toggled='true' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled this guild to \`true\`" }).catch(e => { });
                } else if (row[0].toggled === 'true') {
                    await con.query(`UPDATE guilds SET toggled='false' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled this guild to \`false\`" }).catch(e => { });
                }
            }
        });
    } else if (message.content.toLowerCase() === `${client.config.prefix}togglebans`) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send({ embeds: [new NoMoreFortnite.MessageEmbed().setDescription("You are missing the \`ADMINISTRATOR\` permission to use this command!").setColor("#FFFFFF")] }).catch(e => { });
        await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}'`, async (err, row) => {
            if (err) throw err;
            let bruh = row[0];
            if (bruh.kicks === 'true') return message.channel.send({ content: `Please toggle the kicks to \`false\` for this guild by sending \`${client.config.prefix}togglekicks\` to toggle bans!` }).catch(e => { });
            if (bruh.toggled === 'true') {
                if (bruh.bans === 'false') {
                    await con.query(`UPDATE guilds SET bans='true' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled bans to \`true\`" }).catch(e => { });
                } else if (bruh.bans === 'true') {
                    await con.query(`UPDATE guilds SET bans='false' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled bans to \`false\`" }).catch(e => { });
                }
            } else {
                await message.channel.send({ content: `Please toggle the bot to \`true\` for this guild by sending \`${client.config.prefix}toggleguild\` to use this command!` }).catch(e => { });
            }
        });
    } else if (message.content.toLowerCase() === `${client.config.prefix}togglekicks`) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return message.channel.send({ embeds: [new NoMoreFortnite.MessageEmbed().setDescription("You are missing the \`ADMINISTRATOR\` permission to use this command!").setColor("#FFFFFF")] }).catch(e => { });
        await con.query(`SELECT * FROM guilds WHERE guildid='${message.guild.id}'`, async (err, row) => {
            if (err) throw err;
            let xd = row[0];
            if (xd.bans === 'true') return message.channel.send({ content: `Please toggle the kicks to \`false\` for this guild by sending \`${client.config.prefix}togglekicks\` to toggle bans!` }).catch(e => { });
            if (xd.toggled === 'true') {
                if (xd.kicks === 'false') {
                    await con.query(`UPDATE guilds SET kicks='true' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled kicks to \`true\`" }).catch(e => { });
                } else if (xd.kicks === 'true') {
                    await con.query(`UPDATE guilds SET kicks='false' WHERE guildid='${message.guild.id}'`, async (err, row) => { });
                    await message.channel.send({ content: "I have successfully toggled bans to \`false\`" }).catch(e => { });
                }
            } else {
                await message.channel.send({ content: `Please toggle the bot to \`true\` for this guild by sending \`${client.config.prefix}toggleguild\` to use this command!` }).catch(e => { });
            }
        })
    } else if (message.content.toLowerCase() === `${client.config.prefix}credits`) {
        const credits = new NoMoreFortnite.MessageEmbed()
            .setTitle("Credits")
            .setDescription(`This bot was fully programmed by the one\nand only [Synapse#0100](https://discord.gg/KnveAuW574) (<@272587483190132739>)`)
            .setColor('#FFFFFF')
            .setFooter("Made by Synapse#0100");
        await message.channel.send({ embeds: [credits] }).catch(e => { });
    } else if (message.content.toLowerCase() === `${client.config.prefix}invite`) {
        const embed = new NoMoreFortnite.MessageEmbed()
            .setDescription("You can invite this bot by clicking [here](https://discord.com/api/oauth2/authorize?client_id=891751497111580733&permissions=8&scope=bot)")
            .setColor("#FFFFFF")
        await message.channel.send({ embeds: [embed] }).catch(e => { });
    }
});

client.on('guildCreate', async (guild) => {
    await con.query(`SELECT * FROM guilds WHERE guildid='${guild.id}'`, async (err, row) => {
        if (err) throw err;
        if (!row[0]) {
            await con.query(`INSERT INTO guilds (guildid, toggled, bans, kicks) VALUES ('${guild.id}', 'true', 'false', 'false')`, async (err, row) => { });
        }
    });
});

client.on('guildDelete', async (guild) => {
    await con.query(`SELECT * FROM guilds WHERE guildid='${guild.id}'`, async (err, row) => {
        if (err) throw err;
        if (row[0]) {
            await con.query(`DELETE FROM guilds WHERE guildid='${guild.id}'`, async (err, row) => { });
        }
    });
});

client.login(`${client.config.token}`);
