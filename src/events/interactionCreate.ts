import fs from 'fs';

export = {
    name: 'interactionCreate',
	execute(interaction: any) {
        
        try {
            fs.writeFileSync('./logs/interactions.txt',
            `${interaction.user.tag} in #${interaction.channel.name} triggered the interaction: ${interaction.commandName}\n`,
            {flag: 'a'});
        } catch(e) {
            console.log(e)
        }
	},
}