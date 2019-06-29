import { Command, CommandContext } from "./Command";
import { UserInfo } from "../user/UserInfo";

export class PingCommand extends Command {
    
    public getName(): string {
        return "ping";
    }    
    
    public getDescription(): string {
        return "Affiche le temps de latence entre la commande et la réponse du bot";
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }
    
    public perform(sender: UserInfo, ctx: CommandContext): void {
        ctx.answerEmbed({
            color: 0xB9121B,
            description: `:ping_pong: Pong: \`${Date.now() - ctx.getMessage().createdTimestamp} ms\``
        });
    }


}