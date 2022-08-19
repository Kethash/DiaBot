# Diabot
___
## A bot imitating Kurosawa Dia's behavior

The bot is still under construction, for now I'm planning to make Diabot react in a funny way
___
## Installation

### Prerequisites
* NodeJs v.16.16.0
* Redis with JSON and search modules
* (Optionnal) Docker

#### Run the bot

1. Create a config.json with inside
```json
{
    "token": YOUR BOT TOKEN,
    "clientID": YOUR DISCORD ACCOUNT ID,
    "guildID": YOUR TEST SERVER ID (Not necessary if you  want to deploy global slash command)
}
```

2. Run Dia saaaan !
    * With `npm`:
        * Run `npm install` to install all the needed packages
        * Run `npm run rc` to deploy slash commands
        * Run `npm start` to run Dia saaaan !
    * With **Docker**
        * To launch the bot run `docker compose up -d`
        * To stop => `docker compose down`

Have fun !

#### Redis Database model
|Server config|
|---|
|guildId: { type: 'string' } *The ID of the server*|
|loveleaveChannelId: { type: 'string' } *The ID of the channel where Dia saaaan !!! casts loveleavers*|
|loveleaveTime: { type: 'number' } *The amount of minutes to trigger the "loveleave"*|

|Reported malicious link|
|---|
|guildId: { type: 'string' } *The ID of the server*|
|messageContent: { type: 'text' } *The content of the message*|
|reporter: { type: 'string'} *The user's ID who reported the message*|
|reporterHread: { type: 'string'} *The user's tag and discriminant*|
