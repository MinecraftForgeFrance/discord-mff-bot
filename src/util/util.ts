import axios from "axios";
import {Client, GuildMember, MessageEmbed, Role, TextChannel, User} from "discord.js";
import {Logger} from "winston";
import {CommandContext} from "../commands/CommandContext";
import {UserInfo} from "../user/UserInfo";
import Conf = require("conf");

export function addMemberRole(client: Client, config: Conf<any>, user: User): Promise<GuildMember> {
    const guild = client.guilds.cache.first();
    const role = guild?.roles.cache.find(c => c.name === config.get("roles.member"));
    return guild?.member(user)?.roles.add(role as Role, "Ancien membre de retour") as Promise<GuildMember>;
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
    const member = guild?.members.cache.find(m => m.id === info.getDiscordId());
    const memberRole = guild?.roles.cache.find(r => r.name === config.get("roles.member"));
    const javaRole = guild?.roles.cache.find(r => r.name === config.get("roles.javaDancer"));

    member?.roles.remove(memberRole as Role).catch(logger.error);
    member?.roles.remove(javaRole as Role).catch(logger.error);
    info.setRegistrationStep(0);
}

export const SUCCESS_COLOR: number = 0xFF00;
export const ERROR_COLOR: number = 0xFF0000;
export const INFO_COLOR: number = 0x66FF;
