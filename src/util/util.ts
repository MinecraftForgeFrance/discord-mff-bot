import axios from "axios";
import {conf, logger} from "../app.js";

export async function requestForum(endpoint: string, method: "GET" | "POST", data?: object) {
    try {
        const resp = await axios({
            method,
            url: `${conf.get("forumLink.protocol")}://${conf.get("forumLink.hostname")}:${conf.get("forumLink.port")}/discordapi/${endpoint}`,
            data,
            responseType: "json"
        });
        return resp.data;
    } catch (err) {
        logger.error(`Unable to reach endpoint ${endpoint}. Err:`, err);
    }
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;
