import axios from "axios";
import Conf = require("conf");
import { Client, Guild, GuildChannel, GuildMember, RichEmbed, TextChannel, User, Role } from "discord.js";
import { Logger } from "winston";
import { CommandContext } from "../commands/CommandContext";
import { UserInfo } from "../user/UserInfo";

export function addMemberRole(client: Client, config: Conf<any>, user: User) {
    const guild: Guild = client.guilds.first();
    const role: Role = guild.roles.find("name", config.get("roles.member"));
    return guild.member(user).addRole(role, "Ancien membre de retour");
}

export function memberJoin(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild: Guild = client.guilds.first();
    const channel: GuildChannel = guild.channels.find(c => c.name === config.get("channels.logs"));
    const embed = new RichEmbed();
    embed.setDescription(`**${user.username}** a rejoint le serveur.`);
    embed.setColor(SUCCESS_COLOR);
    (channel as TextChannel).send(embed).catch(logger.error);
}

export function memberLeave(client: Client, config: Conf<any>, user: User, logger: Logger): void {
    const guild: Guild = client.guilds.first();
    const channel: GuildChannel = guild.channels.find(c => c.name === config.get("channels.logs"));
    const embed = new RichEmbed();
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
    }
    catch (err) {
        ctx.getLogger().error(`Unable to reach endpoint ${endpoint}. Err:`, err);
        throw err;
    }
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
