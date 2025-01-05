import axios from 'axios';
import { logger } from '../app.js';
import { conf } from '../config/config.js';

export async function requestForum(endpoint: string, method: 'GET' | 'POST', data?: object) {
    try {
        const resp = await axios({
            method,
            url: `${conf.get('forumLink.protocol')}://${conf.get('forumLink.hostname')}:${conf.get('forumLink.port')}/discordapi/${endpoint}`,
            data,
            responseType: 'json'
        });
        return resp.data;
    }
    catch (err) {
        logger.error(`Unable to reach endpoint ${endpoint}. Err:`, err);
    }
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;
export const AVATAR_URL = "https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png"
