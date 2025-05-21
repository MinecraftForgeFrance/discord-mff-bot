import { Client, EmbedBuilder, Events, User } from 'discord.js';
import { INFO_COLOR, sendEmbedToLogChannel } from 'src/util/util.js';

export default (client: Client): void => {
    client.on(Events.GuildMemberAdd, async member => {
        memberJoin(client, member.user);
    });
};

function memberJoin(client: Client, user: User): void {
    const embed = new EmbedBuilder()
        .setColor(INFO_COLOR)
        .setDescription(`**${user.username}** a rejoint le serveur.`);

    sendEmbedToLogChannel(client, embed);
}
