import { User } from 'discord.js';
import jwt from 'jsonwebtoken';
import { conf } from '../config/config.js';

const JWT_SECRET: string = conf.get('forumLink.registrationSecret');

export function createRegistrationToken(user: User): string {
    return jwt.sign({
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarURL()
    }, JWT_SECRET, { expiresIn: '1h' });
}
