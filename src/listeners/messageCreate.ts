import { Client, Events } from 'discord.js';

export default (client: Client): void => {
    client.on(Events.MessageCreate, async message => {
        if (message.guildId === null) {
            // MP send to the bot.
            // TODO: check if user is registered.
        }
    });
};
