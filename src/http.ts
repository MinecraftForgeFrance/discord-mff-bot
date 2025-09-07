import Fastify, { FastifyRequest } from 'fastify';
import { DecodedTokenFromForum, decodeRegistrationToken, validateUserRegistration } from './util/registration.js';
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
    let payload: DecodedTokenFromForum | undefined;
    try {
        payload = decodeRegistrationToken(token);
        const sender = querySession.getUser(payload.id);
        if (sender.getForumId() !== null) {
            req.usersManager.endSession(querySession);
            reply.status(200).send({ code: 1, message: 'User already registered' });
        }
        else {
            sender.setForumId(payload.forumUid);
            req.usersManager.endSession(querySession);
            await validateUserRegistration(payload, req.discordClient);
            reply.status(200).send({ code: 0, message: 'User registered successfully' });
        }
    }
    catch (error) {
        fastify.log.error(`Registration of user ${payload?.displayName ?? 'invalid token'} failed, ${error}`);
        req.usersManager.endSession(querySession);
        reply.status(500).send({ code: -1, message: 'Internal server error', error });
    }
});

export async function startWebServer(usersManager: UsersManager, client: Client) {
    fastify.decorateRequest('usersManager', {
        getter() {
            return usersManager;
        }
    });
    fastify.decorateRequest('discordClient', {
        getter() {
            return client;
        }
    });

    // Run the server!
    try {
        await fastify.listen({ port: 3000 });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
