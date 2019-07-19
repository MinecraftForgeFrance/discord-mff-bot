import { Guild, Client, User, GuildChannel, TextChannel, GuildMember } from "discord.js";
import Conf = require("conf");
import { Logger } from "winston";
import request = require("request");
import { CommandContext } from "../commands/CommandContext";
import { UserInfo } from "../user/UserInfo";

export function memberJoin(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild: Guild = client.guilds.first();
    const channel: GuildChannel = guild.channels.find("name", config.get("channels.logs"));
    (channel as TextChannel).send({
        description: `${user.username} a rejoint le serveur`,
        color: SUCCESS_COLOR
    }).catch(logger.error);
}

export function memberLeave(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild: Guild = client.guilds.first();
    const channel: GuildChannel = guild.channels.find("name", config.get("channels.logs"));
    (channel as TextChannel).send({
        description: `${user.username} a quitté le serveur`,
        color: ERROR_COLOR
    }).catch(logger.error);
}

export function requestForum(ctx: CommandContext, endpoint: string, method: "GET" | "POST", json: object | boolean): Promise<any> {
    const config = ctx.getConfig();
    return new Promise((resolve, reject) => {
        request({
            uri: `${config.get("forumLink.protocol")}://${config.get("forumLink.hostname")}:${config.get("forumLink.port")}/${endpoint}`,
            json,
            method
        }, (err, response, body) => {
            if(body) {
                resolve(body);
            } else {
                ctx.getLogger().error(`Unable to reach endpoint ${endpoint}. Response code : ${response.statusCode}`);
                if(err) {
                    ctx.getLogger().error(err);
                }
                reject();
            }
        });
    });
}

export function resetMember(client: Client, config: Conf<any>, info: UserInfo, logger: Logger): void {
    const guild: Guild = client.guilds.first();
    const member: GuildMember = guild.members.find("id", info.getDiscordId());
    const memberRole = guild.roles.find("name", config.get("roles.member"));
    const javaRole = guild.roles.find("name", config.get("roles.javaDancer"));
    
    member.removeRole(memberRole).catch(logger.error);
    member.removeRole(javaRole).catch(logger.error);
    info.setRegistrationStep(0);
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;