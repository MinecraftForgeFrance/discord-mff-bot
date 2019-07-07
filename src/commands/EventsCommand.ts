import { Command } from "./Command";
import { CommandContext } from "./CommandContext";
import { UserInfo } from "../user/UserInfo";
import { AllRemainingArgument } from "../parser/ArgumentType";
import { RichEmbed } from "discord.js";
import { requestForum } from "../util/util";

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
    
    public perform(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void): void {
        const search: string = ctx.requiredArg(new AllRemainingArgument(), "recherche");
        const config = ctx.getConfig();
        const forumUrl: string = `${config.get("forumLink.protocol")}://${config.get("forumLink.hostname")}:${config.get("forumLink.port")}`;

        requestForum(ctx, `discordapi/forgeevents?term=${search}`, "GET", true)
            .catch(() => reject())
            .then((body: any) => {
                if(body.message === "No result") {
                    ctx.answerEmbed({
                        description: "Aucun événement ne correspond à cette recherche",
                        color: 0xFF0000
                    });
                    resolve();
                } else {
                    if(Object.keys(body).length > 25) {
                        ctx.answerEmbed({
                            description: "Votre recherche renvoie trop de résultats",
                            color: 0xFF0000
                        });
                    } else {
                        const embed: RichEmbed = new RichEmbed();
                        embed.setColor(0xFF00);
                        embed.setTitle("Liste des événements correspondants à votre recherche");
                        embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");
                        for(let key of Object.keys(body)) {
                            const packageName: string = body[key].package;
                            let description: string = body[key].description;
                            // Value 500 is totally arbitrary
                            if(description.length > 500) {
                                description = description.substr(0, 500) + " ...";
                            }
                            const urlAnchor: string = `${forumUrl}/forgeevents#${body[key].anchors}`;
                            embed.addField(key, `- **Package** : \`${packageName}\`
                            - **Description** : ${description}
                            [Pour plus d'info](${urlAnchor})
                            `);
                        }
                        ctx.answerEmbed(embed);
                    }  
                    resolve();
                }
            });
    }


}