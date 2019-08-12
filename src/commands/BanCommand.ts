import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { DurationArgument, WordArgument, AllRemainingArgument } from "../parser/ArgumentType";
import moment = require("moment");
import { MessageMentions, GuildMember } from "discord.js";
import assert = require("assert");
import { QuerySession } from "../user/UsersManager";
import { ERROR_COLOR, SUCCESS_COLOR } from "../util/util";
import { PermissionBuilder } from "./permission/PermissionBuilder";

export class BanCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().hasPermission("ADMINISTRATOR").build());
        moment.locale("fr");
    }

    public getName(): string {
        return "ban";
    }

    public getDescription(): string {
        return "[duration] <target> [reason]";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "[duration] <targets>";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const duration: moment.Duration | undefined = ctx.optionalArg(new DurationArgument());

        if (duration) {
            ctx.getLogger().debug(`Ban duration : ${duration.asDays()} days`);
        }

        const target = ctx.requiredArg(new WordArgument((word: string) => MessageMentions.USERS_PATTERN.test(word)), "target");
        const result: RegExpExecArray | null = /([0-9]+)/.exec(target);
        assert(result != null && result.length > 0);
        const userId: string = (result as RegExpExecArray)[0];
        const targetedUser: UserInfo = querySession.getUser(userId);
        const banEnd: moment.Moment | null = duration ? moment().add(duration) : null;

        const reason: string | undefined = ctx.optionalArg(new AllRemainingArgument());

        targetedUser.setBanned(true);
        targetedUser.setBannedUntil(banEnd ? banEnd.valueOf() : -1);

        ctx.getLogger().info(`Banned user ${userId} ${banEnd ? "until " + banEnd.valueOf() : "permanently"}. ${reason ? "Reason : " + reason : ""}`);

        const member: GuildMember = ctx.getDiscordClient().guilds.first().members.find("id", userId);

        ctx.answerEmbed({
            description: `L'utilisateur ${member.user.username} a bien été bannis ${banEnd ? "jusqu'à la date du " + banEnd.format("dddd D MMMM YYYY à H:mm:ss") : "de manière permanente"}.
            ${reason ? "Raison : " + reason : ""}`,
            color: SUCCESS_COLOR
        });

        member.user.send({
            embed: {
                description: `Vous avez été banni ${banEnd ? "jusqu'à la date du " + banEnd.format("dddd D MMMM YYYY à H:mm:ss") : "de manière permanente"}.
                ${reason ? "Raison : " + reason : ""}`,
                color: ERROR_COLOR
            }
        })
            .catch(err => {
                ctx.getLogger().error(`Can't tell user he's banned : ${err}`);
                reject();
            })
            .then(() => {
                ctx.getDiscordClient().guilds.first().ban(member)
                    .catch(err => {
                        ctx.getLogger().error(`Can't ban member ${err}`);
                        reject();
                    })
                    .then(() => resolve());
            });
    }
}
