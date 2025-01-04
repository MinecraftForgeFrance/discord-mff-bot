import { Client, Events } from 'discord.js';

export default (client: Client): void => {
    client.on(Events.GuildMemberRemove, async member => {
        // TODO: handle user left the discord.
        console.log(member);
    });
};
