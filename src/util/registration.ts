import { Client, EmbedBuilder, User } from 'discord.js';
import jwt from 'jsonwebtoken';
import { conf } from '../config/config.js';
import { sendEmbedToLogChannel, SUCCESS_COLOR } from './util.js';

const JWT_SECRET: string = conf.get('forumLink.registrationSecret');

export function createRegistrationToken(user: User): string {
    return jwt.sign({
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarURL()
    }, JWT_SECRET, { expiresIn: '1h' });
}

export interface DecodedTokenFromForum extends jwt.JwtPayload {
    id: string;
    displayName: string;
    avatarUrl: string;
    forumUid: number;
}

export function decodeRegistrationToken(token: string): DecodedTokenFromForum {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload !== 'object' || !payload || typeof payload.id !== 'string' || typeof payload.displayName !== 'string' || typeof payload.avatarUrl !== 'string' || !payload.forumUid) {
        throw new Error('Invalid token');
    }
    return payload as DecodedTokenFromForum;
}

/**
 * Set user forum id, add member role and send validation success message.
 */
export async function validateUserRegistration(payload: DecodedTokenFromForum, client: Client): Promise<void> {
    const guild = await client.guilds.fetch(conf.get('application.guildId'));
    const member = await guild.members.fetch(payload.id);
    if (!member.roles.cache.has(conf.get('roles.member'))) {
        member.roles.add(conf.get('roles.member'));
        try {
            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setDescription(`**${member.user.username}** a validé son compte discord.`);

            sendEmbedToLogChannel(client, embed);
        }
        catch (e) {
            console.error('Failed to send message to user', e);
        }
    }
}
