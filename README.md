# Diabot
___
## A bot imitating Kurosawa Dia's behavior

The bot is still under construction, for now I'm planning to do a fake nitro link detection and make Diabot react in a funny way
___
## Installation

### Prerequisites
* NodeJs v.16.16.0
* Redis
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