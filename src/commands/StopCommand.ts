import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { CommandContext } from "./CommandContext";

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
    
    public perform(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void): void {
        ctx.answerEmbed({
            description: ":crescent_moon: Bye bye ...",
            color: 0xFF00,
        });
        ctx.getDiscordClient().destroy().then(() => {
            ctx.getLogger().info("Discord bot stopped successfully.");
            resolve();
        }).catch((err) => {
            ctx.getLogger().error("Can't stop Discord bot ...");
            if(err)
                ctx.getLogger().error(err);
            reject();
        });
    }


}