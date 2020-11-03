import { MessageEmbed } from "discord.js";

import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { AllRemainingArgument } from "../parser/ArgumentType";
import { ERROR_COLOR, requestForum, SUCCESS_COLOR } from "../util/util";

export class EventsCommand extends Command {

    constructor() {
        super((sender, ctx) => true);
    }

    public getName(): string {
        return "events";
    }

    public getDescription(): string {
        return "Permet de consulter la liste des événements fournis par Forge";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<recherche>";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const search: string = ctx.requiredArg(new AllRemainingArgument(), "recherche");
        const config = ctx.getConfig();
        const forumUrl: string = `${config.get("forumLink.protocol")}://${config.get("forumLink.hostname")}:${config.get("forumLink.port")}`;

        requestForum(ctx, `forgeevents?term=${search}`, "GET")
            .catch(() => reject())
            .then(body => {
                if (body.message === "No result") {
                    ctx.answerEmbed({
                        description: "Aucun événement ne correspond à cette recherche",
                        color: ERROR_COLOR
                    });
                    resolve();
                } else {
                    if (Object.keys(body).length > 25) {
                        ctx.answerEmbed({
                            description: "Votre recherche renvoie trop de résultats",
                            color: ERROR_COLOR
                        });
                    } else {
                        const embed = new MessageEmbed();
                        embed.setColor(SUCCESS_COLOR);
                        embed.setTitle("Liste des événements correspondants à votre recherche");
                        embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");
                        for (const key of Object.keys(body)) {
                            const packageName: string = body[key].package;
                            let description: string = body[key].description;
                            // Value 500 is totally arbitrary
                            if (description.length > 500) {
                                description = description.substr(0, 500) + " ...";
                            }
                            const urlAnchor: string = `${forumUrl}/forgeevents#${body[key].anchors}`;
                            embed.addField(key, `- **Package** : \`${packageName}\`
                            - **Description** : ${description}
                            [Pour plus d'info](${urlAnchor})
                            `);
                        }

                        if (embed.length >= 6000) {
                            ctx.answer("Votre recherche renvoie trop de résultats, merci de l'affiner.");
                        } else {
                            ctx.answerEmbed(embed);
                        }
                    }
                    resolve();
                }
            });
    }
}
