import { TextChannel } from "discord.js";

import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { UserArgument, WordArgument } from "../parser/ArgumentType";
import { ERROR_COLOR, memberLeave, resetMember, SUCCESS_COLOR } from "../util/util";

export class ResetCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().hasPermission("ADMINISTRATOR").build());
    }

    public getName(): string {
        return "reset";
    }

    public getDescription(): string {
        return "Remet le compte de la personne visée à zéro";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<all | @user>";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const target: UserInfo | undefined = ctx.optionalArg(new UserArgument(querySession));
        const all = ctx.optionalArg(new WordArgument(word => word === "all"));

        if (!target && !all) {
            throw {
                errorType: "argument",
                message: "Veuillez renseigner `all` ou mentionner un utilisateur."
            };
        }

        if (target) {
            resetMember(ctx.getDiscordClient(), ctx.getConfig(), target, ctx.getLogger());
            ctx.answerPrivateEmbed({
                description: "Votre compte a bien été remis à zéro.",
                color: SUCCESS_COLOR
            });
            memberLeave(ctx.getDiscordClient(), ctx.getConfig(), ctx.getMessage().author, ctx.getLogger());
        } else if (all) {
            const guild = ctx.getDiscordClient().guilds.cache.first();
            guild?.members.cache.forEach(member => {
                resetMember(ctx.getDiscordClient(), ctx.getConfig(), querySession.getUser(member.user.id), ctx.getLogger());
            });
            (guild?.channels.cache.find(c => c.name === ctx.getConfig().get("channels.logs")) as TextChannel)
                .send({
                    embed: {
                        description: "Tout le monde a quitté le serveur !",
                        color: ERROR_COLOR
                    }
                });
            ctx.answerEmbed({
                description: "Tout le monde a été remis à zéro.",
                color: SUCCESS_COLOR
            });
        }
        resolve();
    }
}
