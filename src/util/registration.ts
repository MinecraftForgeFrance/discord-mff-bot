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

interface DecodedTokenFromForum extends jwt.JwtPayload {
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
