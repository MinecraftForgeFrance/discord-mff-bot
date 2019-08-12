import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { VersionArgument, AllRemainingArgument, WordArgument } from "../parser/ArgumentType";
import { RichEmbed } from "discord.js";
import { requestForum, ERROR_COLOR, SUCCESS_COLOR } from "../util/util";
import { QuerySession } from "../user/UsersManager";

export class TutorialCommand extends Command {

    constructor() {
        super((sender, ctx) => true);
    }

    public getName(): string {
        return "tutorial";
    }

    public getDescription(): string {
        return "Affiche la liste des tutoriels crrespondants à la recherche";
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
        requestForum(ctx, `discordapi/tutorial?term=${search}${tagsParameter}&token=${config.get("forumLink.token")}`, "GET", true)
            .catch(() => reject())
            .then((body: any) => {
                if (body.message === "No result") {
                    ctx.answerEmbed({
                        description: "Aucun résultat ne correspond à votre recherche",
                        color: ERROR_COLOR
                    });
                    resolve();
                } else {
                    const embed: RichEmbed = new RichEmbed();
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
                            }
                            else {
                                if (fieldContent[prefixArray.lastIndexOf(key)].length <= (1024 - field.length)) {
                                    fieldContent[prefixArray.lastIndexOf(key)] += `\n${field}`;
                                }
                                else {
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
                    }
                    else {
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
