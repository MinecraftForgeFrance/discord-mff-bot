import Conf from 'conf';

interface BotConfig {
    application: {
        token: string;
        clientId: string;
        guildId: string;
    },
    forumLink: {
        protocol?: string;
        port?: number;
        hostname: string;
        token: string;
        registrationSecret: string;
    },
    channels: {
        bot: string;
        logs: string;
        moddingSupport: string;
        rules: string;
        shoutbox: string;
    },
    roles: {
        member: string;
        support: string;
    }
}

const schema = {
    application: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            clientId: { type: 'string' },
            guildId: { type: 'string' }
        },
        required: ['token', 'clientId', 'guildId'],
        default: {}
    },
    forumLink: {
        type: 'object',
        properties: {
            protocol: {
                type: 'string',
                pattern: 'https?',
                default: 'https'
            },
            port: { type: 'integer', default: 443 },
            hostname: { type: 'string' },
            token: { type: 'string' },
            registrationSecret: { type: 'string' }
        },
        required: ['hostname', 'token', 'registrationSecret'],
        default: {}
    },
    channels: {
        type: 'object',
        properties: {
            bot: {
                type: 'string'
            },
            logs: {
                type: 'string'
            },
            moddingSupport: {
                type: 'string'
            },
            rules: {
                type: 'string'
            },
            shoutbox: {
                type: 'string'
            }
        },
        required: ['logs', 'moddingSupport', 'shoutbox'],
        default: {}
    },
    roles: {
        type: 'object',
        properties: {
            member: {
                type: 'string'
            },
            support: {
                type: 'string'
            }
        },
        required: ['member', 'support'],
        default: {}
    }
};

export const conf = new Conf<BotConfig>({
    configName: 'bot-config',
    cwd: './config',
    schema
});
