import { MessageEmbed } from "discord.js";

import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { ERROR_COLOR, requestForum, SUCCESS_COLOR } from "../util/util";
import { AllRemainingArgument, VersionArgument, WordArgument } from "../parser/ArgumentType";

export class TutorialCommand extends Command {

    constructor() {
        super((sender, ctx) => true);
    }

    public getName(): string {
        return "tutorial";
    }

    public getDescription(): string {
        return "Affiche la liste des tutoriels correspondants à la recherche";
    }

    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "[-v <version>] <search>";
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        let tagsParameter: string = "";
        if (ctx.optionalArg(new WordArgument(word => word === "-v"))) {
            const version: string = ctx.requiredArg(new VersionArgument(), "version");
            tagsParameter = `&hasTags[]=${version}`;
        }
        const search: string = ctx.requiredArg(new AllRemainingArgument(), "search");
        const config = ctx.getConfig();
        requestForum(ctx, `tutorial?term=${search}${tagsParameter}&token=${config.get("forumLink.token")}`, "GET")
            .catch(() => reject())
            .then(body => {
                if (body.message === "No result") {
                    ctx.answerEmbed({
                        description: "Aucun résultat ne correspond à votre recherche",
                        color: ERROR_COLOR
                    });
                    resolve();
                } else {
                    const embed = new MessageEmbed();
                    embed.setColor(SUCCESS_COLOR);
                    embed.setTitle("Liste des tutoriels");
                    embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");

                    const prefixArray: string[] = [];
                    const fieldContent: string[] = [];
                    for (const key of Object.keys(body)) {
                        for (let i = 0; i < body[key].length; i++) {
                            const field: string = `- [${body[key][i].title}](${body[key][i].url})`;
                            if (!prefixArray.includes(key)) {
                                prefixArray.push(key);
                                fieldContent.push(field);
                            } else {
                                if (fieldContent[prefixArray.lastIndexOf(key)].length <= (1024 - field.length)) {
                                    fieldContent[prefixArray.lastIndexOf(key)] += `\n${field}`;
                                } else {
                                    prefixArray.push(key);
                                    fieldContent.push(field);
                                }
                            }
                        }
                    }

                    let embedSize: number = (embed.title as string).length;
                    for (let i = 0; i < prefixArray.length; i++) {
                        embedSize += prefixArray[i].length + fieldContent[i].length;
                    }

                    if (prefixArray.length >= 25 || embedSize >= 6000) {
                        ctx.answerEmbed({
                            description: "Votre recherche renvoie trop de résulats.",
                            color: ERROR_COLOR
                        });
                    } else {
                        for (let i = 0; i < prefixArray.length; i++) {
                            embed.addField(prefixArray[i], fieldContent[i]);
                        }
                        ctx.answerEmbed(embed);
                    }
                    resolve();
                }
            });
    }
}
