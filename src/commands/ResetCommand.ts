import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { Guild, Role } from "discord.js";
import { memberLeave, SUCCESS_COLOR } from "../util/util";

export class ResetCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().channelTypeIs("dm").build());
    }

    public getName(): string {
        return "reset";
    }    
    
    public getDescription(): string {
        return "Remet votre compte à zéro";
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }
    
    public perform(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void): void {
        sender.setRegistrationStep(0);

        const guild: Guild = ctx.getDiscordClient().guilds.first();
        const role: Role = guild.roles.find("name", ctx.getConfig().get("roles.member"));
        guild.member(ctx.getMessage().author).removeRole(role).catch(ctx.getLogger().error);
        ctx.answerPrivateEmbed({
            description: "Votre compte a bien été remis à zéro.",
            color: SUCCESS_COLOR
        });
        memberLeave(ctx.getDiscordClient(), ctx.getConfig(), ctx.getMessage().author, ctx.getLogger());
        resolve();
    }

}