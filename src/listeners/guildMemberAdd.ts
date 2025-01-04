import { Client, Events } from 'discord.js';

export default (client: Client): void => {
    client.on(Events.GuildMemberAdd, async member => {
        // TODO: handle registration.
        console.log(member);
    });
};
