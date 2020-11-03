import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { SUCCESS_COLOR } from "../util/util";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { PermissionBuilder } from "./permission/PermissionBuilder";

export class StopCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().hasPermission("ADMINISTRATOR").build());
    }

    public getName(): string {
        return "stop";
    }

    public getDescription(): string {
        return "Arrête le bot";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        ctx.answerEmbed({
            description: ":crescent_moon: Bye bye ...",
            color: SUCCESS_COLOR,
        });
        try {
            ctx.getDiscordClient().destroy();
            ctx.getLogger().info("Discord bot stopped successfully.");
            resolve();
        } catch (err) {
            ctx.getLogger().error("Can't stop Discord bot ...");
            if (err) {
                ctx.getLogger().error(err);
            }
            reject();
        }
    }
}
