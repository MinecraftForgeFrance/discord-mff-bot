import { Client, EmbedBuilder, Events, User } from 'discord.js';
import { ERROR_COLOR, sendEmbedToLogChannel } from 'src/util/util.js';


export default (client: Client): void => {
    client.on(Events.GuildMemberRemove, async member => {
        memberLeave(client, member.user);
    });
};

function memberLeave(client: Client, user: User): void {
    const embed = new EmbedBuilder()
        .setColor(ERROR_COLOR)
        .setDescription(`**${user.username}** a quitté le serveur.`);

    sendEmbedToLogChannel(client, embed);
}
