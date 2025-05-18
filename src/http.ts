import Fastify, { FastifyRequest } from 'fastify';
import { decodeRegistrationToken } from './util/registration.js';
import { UsersManager } from './users/UsersManager.js';
import { Client } from 'discord.js';
import { conf } from './config/config.js';

// Type override
declare module 'fastify' {
  interface FastifyRequest {
    usersManager: UsersManager;
    discordClient: Client;
  }
}

const fastify = Fastify({
  logger: true
});

const schema = {
    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        }
    }
};

fastify.post('/registration/callback', { schema }, async (req: FastifyRequest<{ Body: { token: string } }>, reply) => {
    const token = req.body.token;
    const querySession = req.usersManager.beginSession();
    const payload = decodeRegistrationToken(token);
    const sender = querySession.getUser(payload.id);
    req.usersManager.endSession(querySession);
    if (sender.getForumId() !== null) {
        reply.status(200).send({ message: 'User already registered' });
    }
    else {
        sender.setForumId(payload.forumUid);
        const guild = await req.discordClient.guilds.fetch(conf.get('application.guildId'));
        const member = await guild.members.fetch(payload.id);
        if (!member.roles.cache.has(conf.get('roles.member'))) {
            member.roles.add(conf.get('roles.member'));
            try {
                member.send('Félicitations, vous êtes désormais membre du discord Minecraft Forge France ! Vous avez désormais accès à tous les salons.');
            }
            catch (e) {
                console.error('Failed to send message to user', e);
            }
        }
        reply.status(200).send({ message: 'User registered successfully' });
    }
});

export async function startWebServer(usersManager: UsersManager, client: Client) {
    fastify.decorateRequest('usersManager', usersManager);
    fastify.decorateRequest('discordClient', client);

    // Run the server!
    try {
        await fastify.listen({ port: 3000 });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
