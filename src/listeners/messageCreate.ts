import { Client, Events } from 'discord.js';
import { conf } from '../config/config.js';
import { FORUM_URL } from 'src/util/util.js';
import { UsersManager } from '../users/UsersManager.js';
import { createRegistrationToken } from '../util/registration.js';

export default (client: Client, usersManager: UsersManager): void => {
    client.on(Events.MessageCreate, async message => {
        // MP sent to the bot.
        if (message.guildId === null) {
            const querySession = usersManager.beginSession();
            const sender = querySession.getUser(message.author.id);
            usersManager.endSession(querySession);
            if (sender.getForumId() !== null) {
                const guild = await client.guilds.fetch(conf.get('application.guildId'));
                const member = await guild.members.fetch(message.author.id);
                if (!member.roles.cache.has(conf.get('roles.member'))) {
                    await member.roles.add(conf.get('roles.member'));
                    try {
                        await message.author.send('Bon retour parmis nous ! Vous avez été automatiquement réintégré dans le groupe des membres.');
                    }
                    catch (e) {
                        console.error('Failed to send message to user', e);
                    }
                }
            }
            else {
                const token = createRegistrationToken(message.author);
                try {
                    await message.author.send(`Bienvenue sur le discord de Minecraft Forge France!
Ce discord est exclusivement réservé aux membres du forum.

Liez votre compte forum à votre discord [en cliquant ici](${FORUM_URL}/discord?token=${token})
Ne partagez pas ce lien. En cas d'expiration, renvoyez-moi un message privé pour obtenir un nouveau lien.`);
                }
                catch (e) {
                    console.error('Failed to send message to user', e);
                }
            }
        }
    });
};
