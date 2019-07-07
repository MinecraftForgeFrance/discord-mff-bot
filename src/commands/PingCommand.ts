import { UserInfo } from "../user/UserInfo";
import { Command } from "./Command";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { CommandContext } from "./CommandContext";
import { INFO_COLOR } from "../util/util";

export class PingCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().channelTypeIs("dm").build());
    }

    public getName(): string {
        return "ping";
    }

    public getDescription(): string {
        return "Affiche le temps de latence entre la commande et la réponse du bot";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }

    public perform(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void): void {
        ctx.answerEmbed({
            color: INFO_COLOR,
            description: `:ping_pong: Pong: \`${Date.now() - ctx.getMessage().createdTimestamp} ms\``,
        });
        resolve();
    }


}