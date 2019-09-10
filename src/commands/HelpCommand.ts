import {CommandsDispatcher} from "./CommandsDispatcher";
import {Command} from "./Command";
import {UserInfo} from "../user/UserInfo";
import {CommandContext} from "./CommandContext";
import {RichEmbed} from "discord.js";
import {INFO_COLOR} from "../util/util";
import {QuerySession} from "../user/UsersManager";

export class HelpCommand extends Command {

    constructor(private dispatcher: CommandsDispatcher) {
        super((sender, ctx) => true);
    }

    public getName(): string {
        return "help";
    }

    public getDescription(): string {
        return "Affiche les commandes disponibles";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const embed: RichEmbed = new RichEmbed();
        embed.setTitle("Liste des commandes");
        embed.setAuthor(ctx.getMessage().author.username, ctx.getMessage().author.avatarURL);
        embed.setColor(INFO_COLOR);

        Object.values(this.dispatcher.getCommands()).forEach(command => {
            // Max : 25 fields (https://discord.js.org/#/docs/main/stable/class/RichEmbed?scrollTo=addField)
            if ((!embed.fields || embed.fields.length < 25) && command.shouldDisplayInHelp(sender, ctx)) {
                embed.addField(
                    command.getName().toLowerCase(),
                    `${command.getDescription()}
                    Usage : \`${ctx.getConfig().get("commandPrefix")}${command.getName().toLowerCase()} ${command.getUsage(sender, ctx)}\``
                );
            }
        });

        ctx.answerEmbed(embed);
        resolve();
    }
}
