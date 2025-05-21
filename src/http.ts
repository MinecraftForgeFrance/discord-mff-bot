import Fastify, { FastifyRequest } from 'fastify';
import { decodeRegistrationToken, validateUserRegistration } from './util/registration.js';
import { UsersManager } from './users/UsersManager.js';
import { Client } from 'discord.js';

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
    if (sender.getForumId() !== null) {
        req.usersManager.endSession(querySession);
        reply.status(200).send({ message: 'User already registered' });
    }
    else {
        validateUserRegistration(sender, payload, req.discordClient);
        req.usersManager.endSession(querySession);
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
