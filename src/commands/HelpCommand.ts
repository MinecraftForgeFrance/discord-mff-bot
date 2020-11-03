import { MessageEmbed } from "discord.js";

import { Command } from "./Command";
import { INFO_COLOR } from "../util/util";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { CommandsDispatcher } from "./CommandsDispatcher";

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
        const embed = new MessageEmbed();
        embed.setTitle("Liste des commandes");
        embed.setAuthor(ctx.getMessage().author.username, ctx.getMessage().author.displayAvatarURL());
        embed.setColor(INFO_COLOR);

        Object.values(this.dispatcher.getCommands()).forEach(command => {
            // Max : 25 fields (https://discord.js.org/#/docs/main/stable/class/MessageEmbed?scrollTo=addField)
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
