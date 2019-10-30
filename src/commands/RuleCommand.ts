import {Command} from "./Command";
import {CommandContext} from "./CommandContext";
import {QuerySession} from "../user/UsersManager";
import {UserInfo} from "../user/UserInfo";
import {PermissionBuilder} from "./permission/PermissionBuilder";
import {RichEmbed, TextChannel} from "discord.js";
import {INFO_COLOR} from "../util/util";
import fs = require("fs");

export class RuleCommand extends Command {

    constructor() {
        super(PermissionBuilder.new().hasPermission("ADMINISTRATOR").build());
    }

    getDescription(): string {
        return "Permet de modifier l'ensemble des règles du discord";
    }

    getName(): string {
        return "regle";
    }

    getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "";
    }

    perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const embed: RichEmbed = new RichEmbed();
        const channels: TextChannel[] = [
            ctx.getDiscordClient().channels.find(value => (value as TextChannel).name === ctx.getConfig().get("channels.aide_modding")) as TextChannel,
            ctx.getDiscordClient().channels.find(value => (value as TextChannel).name === ctx.getConfig().get("channels.recrutement")) as TextChannel,
            ctx.getDiscordClient().channels.find(value => (value as TextChannel).name === ctx.getConfig().get("channels.flood")) as TextChannel
        ];
        const channel: TextChannel = ctx.getDiscordClient().channels.find(value => (value as TextChannel).name === ctx.getConfig().get('channels.rules')) as TextChannel;

        async function clear() {
            let fetched;
            do {
                fetched = await channel.fetchMessages({limit: 1});
                await channel.bulkDelete(fetched);
            } while (fetched.size >= 2);
        }

        clear().then(() => ctx.getLogger().info("Delete all message with success"));
        embed.setTitle(":scroll: RÈGLES DU DISCORD DE MINECRAFT FORGE FRANCE");
        embed.setDescription("───────────────────────────────────");
        embed.setColor(INFO_COLOR);
        embed.setThumbnail("https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png");

        if (fs.existsSync("rule.txt")) {
            const fileContent = fs.readFileSync("rule.txt").toString().split("\n");
            for (let i = 0; i < fileContent.length; i++) {
                if (fileContent[i].match(/#([a-zA-Z-]+)/g)) {
                    fileContent[i] = fileContent[i].replace(/#([a-zA-Z-]+)/g, (match, name) => {
                        let temp: string = "";
                        for (const value of channels) {
                            if (value.name === name) {
                                temp = value.toString();
                            }
                        }
                        return temp;
                    });
                }
                embed.addField(`${i + 1}.`, fileContent[i]);
            }

            channel.send(embed);
        }
        resolve();
    }
}
