import axios from "axios";
import { Logger } from "winston";
import Conf from "conf/dist/source";
import { Client, TextChannel, User, MessageEmbed } from "discord.js";

import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "../commands/CommandContext";

export function addMemberRole(client: Client, config: Conf<any>, user: User) {
    const guild = client.guilds.cache.first();
    if (!guild) {
        throw new Error('guild is undefined');
    }
    const role = guild.roles.cache.find(r => r.name === config.get("roles.member"));
    if (!role) {
        throw new Error('role is undefined');
    }

    const member = guild.member(user);

    if (!member) {
        throw new Error('member is undefined');
    }

    return member.roles.add(role, "Ancien membre de retour");
}

export function memberJoin(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild = client.guilds.cache.first();
    const channel = guild?.channels.cache.find(c => c.name === config.get("channels.logs"));
    const embed = new MessageEmbed();
    embed.setDescription(`**${user.username}** a rejoint le serveur.`);
    embed.setColor(SUCCESS_COLOR);
    (channel as TextChannel).send(embed).catch(logger.error);
}

export function memberLeave(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild = client.guilds.cache.first();
    const channel = guild?.channels.cache.find(c => c.name === config.get("channels.logs"));
    const embed = new MessageEmbed();
    embed.setDescription(`**${user.username}** a quitté le serveur.`);
    embed.setColor(ERROR_COLOR);
    (channel as TextChannel).send(embed).catch(logger.error);
}

export async function requestForum(ctx: CommandContext, endpoint: string, method: "GET" | "POST", data?: object) {
    const config = ctx.getConfig();
    try {
        const resp = await axios({
            method: method,
            url: `${config.get("forumLink.protocol")}://${config.get("forumLink.hostname")}:${config.get("forumLink.port")}/discordapi/${endpoint}`,
            data,
            responseType: 'json'
        });
        return resp.data;
    } catch (err) {
        ctx.getLogger().error(`Unable to reach endpoint ${endpoint}. Err:`, err);
        throw err;
    }
}

export function resetMember(client: Client, config: Conf<any>, info: UserInfo, logger: Logger): void {
    const guild = client.guilds.cache.first();
    const member = guild?.member(info.getDiscordId());
    const memberRole = guild?.roles.cache.find(r => r.name === config.get("roles.member"));
    const javaRole = guild?.roles.cache.find(r => r.name === config.get("roles.javaDancer"));

    if (member && memberRole && javaRole) {
        member.roles.remove(memberRole).catch(logger.error);
        member.roles.remove(javaRole).catch(logger.error);
    }

    info.setRegistrationStep(0);
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;
