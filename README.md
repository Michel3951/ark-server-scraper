# ark-server-scraper
Fetch your ark server every X minutes to keep up-to-date

# Installation
You need to install [Node.js](https://nodejs.org/en/download/) first (v10+). After that clone this in to any folder you like
After these 2 steps you need to install the required packages. Open a terminal in the folder and type `npm install`.
### Creating the bot
Now the first part is done. In order to get the bot online you need to make one first, you can do this [here](https://discordapp.com/developers/applications/) click on "New Application" and give it a fancy name.
Go to the "Bot" section and click on "Add bot", after that copy your token (Not your client id) and paste it in `config/config.json`. Now you need to set a channel where the bot should post the messages
DM's are not supported, make sure the bot has permission to read & send messages, to set a channel go to `config/config.json` and paste a channel ID. You can get the channel id by typing `\#channel-name` on discord. To track a server copy the url from the battlemetrics page, for example ```https://www.battlemetrics.com/servers/ark/73185```
and put it inside the servers array in `config/config.json`. If you're not a programmer, it should look something like this:
```   
{
  "token": "YOUR_TOKEN_HERE",
  "interval": 5,
  "channelID": "CHANNEL_ID_HERE",
  "mode": 2,
  "servers": [
    "https://www.battlemetrics.com/servers/ark/12345",
    "https://www.battlemetrics.com/servers/ark/123456"
  ]
}
```
Finally, invite your bot. You can invite your bot via this link
```https://discordapp.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8```
replace `YOUR_CLIENT_ID` with the client id of your bot, found on the General page on discord.
### Getting your bot online
To start your bot, open a terminal window in the bot's main folder and type `node .` or `node index.js`. The bot will now log the server every 5 minutes.
The bot will go offline when the terminal is closed, you can use a process manager like [PM2](https://www.npmjs.com/package/pm2) to keep it running forever.

# Configuration
There are a few configuration settings found in `config/config.json`
### Interval
The amount of minutes the bot should check the servers. Keep in mind that a lower interval can get you rate limited
### Mode
The information that will be posted
1. General information only
2. Player list only
3. General information + mod list
4. General information + player list
5. All

**If you come across any problems, or have any questions, please create an issue.**
