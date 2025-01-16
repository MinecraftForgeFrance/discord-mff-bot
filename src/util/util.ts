import axios from 'axios';
import { ApplicationCommandOptionChoiceData } from 'discord.js';

import { logger } from '../app.js';
import { conf } from '../config/config.js';

interface Post {
    title: string;
    url: string;
}

export interface RegisterResponse {
    result: string;
    userId: number;
}

interface ErrorResponse {
    message: string;
}

export interface ResponseData {
    data: {
        [tag: string]: Post[];
    };
}

export type ApiResponse = ResponseData | ErrorResponse | RegisterResponse;

interface Tag {
    value: string;
    valueEscaped: string;
}

export function isOk(response: ApiResponse): response is ResponseData {
    return 'data' in response && typeof response.data === 'object';
}

export function isError(response: ApiResponse): response is ErrorResponse {
    return 'message' in response;
}

/**
 * Makes a request to the forum API.
 * @param endpoint - The API endpoint to call.
 * @param method - The HTTP method to use (GET or POST).
 * @param data - Optional request payload.
 * @returns The API response as `ApiResponse`.
 */
export async function requestForum(endpoint: string, method: 'GET' | 'POST', data?: object): Promise<ApiResponse> {
    try {
        const resp = await axios<ApiResponse>({
            method,
            url: `${conf.get('forumLink.protocol')}://${conf.get('forumLink.hostname')}:${conf.get('forumLink.port')}/discordapi/${endpoint}`,
            data,
            responseType: 'json'
        });
        return resp.data;
    }
    catch (err) {
        logger.error(`Unable to reach endpoint ${endpoint}. Err:`, err);
        return { message: 'An error occurred while fetching data.' } as ErrorResponse;
    }
}

export async function fetchDynamicChoices(): Promise<ApplicationCommandOptionChoiceData<string>[] | ErrorResponse> {
    try {
        const response = await fetch(`${conf.get('forumLink.protocol')}://${conf.get('forumLink.hostname')}:${conf.get('forumLink.port')}/api/tags`);
        if (!response.ok) {
            logger.error('Unable to fetch dynamic choices.');
            return { message: 'Unable to fetch dynamic choices.' } as ErrorResponse;
        }
        const data = await response.json() as { tags: Tag[] };
        return data.tags.map((tag: Tag) => ({ name: tag.value, value: tag.valueEscaped } as ApplicationCommandOptionChoiceData<string>));
    }
    catch (err) {
        logger.error('Unable to reach tag. Err:', err);
        return { message: 'An error occurred while fetching data.' } as ErrorResponse;
    }
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;
export const AVATAR_URL = 'https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png';
