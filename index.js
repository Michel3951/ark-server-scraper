const {MessageEmbed, Client} = require('discord.js');
const fetch = require('node-fetch');
const {token, interval, servers, channelID, mode, console_servers, apikey, status} = require('./config/config');

const client = new Client();

if (!token) return error("Please specify a token in config/config.json");
if (typeof token !== "string") return error(`Token must be a string, ${typeof token} given.`);

client.on('ready', () => {
    log('Logged into the Discord API.');

    if (typeof channelID !== 'string') return error(`The channel ID must be a string, ${typeof channel} given.`);
    if (typeof servers !== 'object') return error(`The channel ID must an object (array), ${typeof servers} given.`);
    if (!client.channels.cache.has(channelID)) return error(`The bot cannot access the channel with id ${channelID}, make sure the bot can read & send messages.`);
    let channel = client.channels.cache.get(channelID);
    if (channel.type !== 'text') return error(`${channel.name} is not a text channel.`);
    let guild = channel.guild;
    let clientAsMember = guild.me;

    if (status) {
        if (status.length > 32) {
            error('The status may not be greater then 32 characters in length.');
        } else {
            client.user.setActivity(status, {type: 'PLAYING'}).catch(console.error);
        }
    }

    fetchServers();

    setInterval(() => {
        fetchServers();
    }, interval * 60e3);

    function fetchServers() {
        if (servers) {
            servers.forEach(server => {
                let id = server.url.match(/[0-9]+$/)[0] || null;

                if (id) {
                    fetch(`https://api.battlemetrics.com/servers/${id}`)
                        .then(res => res.json())
                        .then(json => {
                            if (json.data.relationships.game.data.id !== 'ark') return warn(`Server ${server.url} is not running the game ARK: Survival Evolved.`);
                            if (!channel.permissionsFor(clientAsMember).has('SEND_MESSAGES')) return warn(`I cannot send messages in ${channel.name}`);
                            let override = null;
                            if (server.channel) {
                                if (client.channels.cache.has(server.channel)) {
                                    override = client.channels.cache.get(server.channel);
                                } else {
                                    warn('The channel ID provided for ' + server.name + ' is not valid.');
                                }
                            }
                            if (mode === 1) { //General information only
                                general(override ? override : channel, json);
                            }

                            if (mode === 2) { //Player list only
                                players(override ? override : channel, json);
                            }

                            if (mode === 3) { // General information + mod list
                                general(override ? override : channel, json);
                                mods(override ? override : channel, json);
                            }

                            if (mode === 4) { // General information + player list
                                general(override ? override : channel, json);
                                players(override ? override : channel, json);
                            }

                            if (mode === 5) { // All
                                general(override ? override : channel, json);
                                mods(override ? override : channel, json);
                                players(override ? override : channel, json);
                            }
                        });
                } else {
                    warn(`Unable to extract ID from URL. URL: ${server}`)
                }
            });
        }
        if (console_servers) {
            console_servers.forEach(server => {
                fetch(`https://api.michel3951.com/api/v1/ark/server?apikey=${apikey}&platform=${server.platform}&name[]=${server.name}`)
                    .then(res => res.json())
                    .then(json => {
                        if (!json.content) return error(json.message);
                        if (server.channel) {
                            if (client.channels.cache.has(server.channel)) {
                                consolex(client.channels.cache.get(server.channel), json);
                            } else {
                                consolex(channel, json);
                                warn('The channel ID provided for ' + server.name + ' is not valid.');
                            }
                        }
                    });
            });
        }
    }
});

function players(channel, json) {
    fetch(`https://api.battlemetrics.com/players?filter[servers]=${json.data.id}&filter[online]=true&page[size]=99`)
        .then(res => res.json())
        .then(players => {
            let message = players.data.map(player => player.attributes.name).join('\n').substring(0, (2000 - json.data.attributes.name.length));
            channel.send(`**Players - ${json.data.attributes.name}**\`\`\`\n${message ? message : 'No players online!'}\`\`\``).catch(e => {
                error(e.message);
            });
        });
}

function mods(channel, json) {
    let details = json.data.attributes.details;
    let embed = new MessageEmbed();

    embed.setTitle(`Mods - ${json.data.attributes.name}`);
    embed.setColor('GREEN');
    if (details.modNames[0]) {
        let result = [];
        details.modNames.forEach((mod, index) => {
            result.push(`[${mod || 'Unknown'} - ${details.modIds[index]}](https://steamcommunity.com/sharedfiles/filedetails/?id=${details.modIds[index]})`);
            if (index + 1 === details.modNames.length || index >= 49) {
                embed.setDescription(result.join('\n'));
                channel.send(embed).catch(e => {
                    error(e.message);
                });
            }
        });
    }
}

function general(channel, json) {
    let data = json.data.attributes;
    let embed = new MessageEmbed();

    embed.setColor('GREEN');
    embed.setTitle(data.name);
    embed.addField('Status', data.status.charAt(0).toUpperCase() + data.status.slice(1), true);
    embed.addField('Players', `${data.players}/${data.maxPlayers}`, true);
    embed.addField('Rank', `#${data.rank}`, true);
    embed.addField('Map', data.details.map, true);
    embed.addField('Official', data.details.official ? 'Yes' : 'No', true);
    embed.addField('PvP', data.details.pve ? 'No' : 'Yes', true);
    embed.addField('Mods', data.details.modIds ? data.details.modIds.length : 'None', true);

    channel.send(`steam://connect/${data.ip}:${data.port}`, {embed: embed}).catch(e => {
        error(e.message);
    });
}

function consolex(channel, json) {
    let server = json.content[0];
    channel.send(`[${server.Name}] There are ${server.NumPlayers} out of ${server.MaxPlayers} online players online.`)
}

function log(msg) {
    console.log(`\x1b[0m\x1b[42m[Client]\x1b[0m ${msg}`)
}

function warn(msg) {
    console.log(`\x1b[0m\x1b[43m[Warn]\x1b[0m ${msg}`)
}

function error(msg) {
    console.log(`\x1b[0m\x1b[41m[Error]\x1b[0m ${msg}`)
}

client.login(token).catch(console.error);