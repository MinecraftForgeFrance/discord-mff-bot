import { Client, Events } from 'discord.js';
import { conf } from '../config/config.js';
import { UsersManager } from '../users/UsersManager.js';
import { createRegistrationToken } from 'src/util/registration.js';

export default (client: Client, usersManager: UsersManager): void => {
    client.on(Events.MessageCreate, async message => {
        // MP send to the bot.
        if (message.guildId === null) {
            const querySession = usersManager.beginSession();
            const sender = querySession.getUser(message.author.id);
            usersManager.endSession(querySession);
            if (sender.getForumId() !== null) {
                const guild = await client.guilds.fetch(conf.get('application.guildId'));
                const member = await guild.members.fetch(message.author.id);
                if (!member.roles.cache.has(conf.get('roles.member'))) {
                    member.roles.add(conf.get('roles.member'));
                    message.author.send('Bon retour parmis nous ! Vous avez été automatiquement réintégré dans le groupe des membres.');
                }
            }
            else {
                const token = createRegistrationToken(message.author);
                message.author.send(`Bienvenue sur le discord de Minecraft Forge France!
Ce discord est exclusivement réservé aux membres du forum.

Liez votre compte forum à votre discord [en cliquant ici](${conf.get('forumLink.protocol')}://${conf.get('forumLink.hostname')}/discord?token=${token})
Ne partagez pas ce lien. En cas d'expiration, renvoyez-moi un message privé pour obtenir un nouveau lien.`);
            }
        }
    });
};
