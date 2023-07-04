import {Command} from "./Command.js";
import {ApplicationCommandOptionType, ApplicationCommandType} from "discord-api-types/v10";
import {ChatInputCommandInteraction, Client, EmbedBuilder} from "discord.js";
import {ERROR_COLOR, requestForum, SUCCESS_COLOR} from "../util/util.js";
import {conf} from "../app.js";

export const TutorialCommand: Command = {
    name: "tutorial",
    nameLocalizations: {
        fr: "tutoriel"
    },
    description: "Displays the list of tutorials matching the search",
    descriptionLocalizations: {
        fr: "Affiche la liste des tutoriels correspondants à la recherche"
    },
    type: ApplicationCommandType["ChatInput"],
    options: [
        {
            name: "subject",
            description: "This subject of research",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "version",
            description: "This version of research", // TODO : Add description is required
            type: ApplicationCommandOptionType.String,
            /*choices: [
                {
                    name: "",
                    value: ""
                }
            ],*/
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        let tagsParameter = "";
        const version = interaction.options.getString("version") ?? "";
        if (version != "") {
            tagsParameter = `&hasTags[]=${version}`;
        }
        const subject = interaction.options.getString("subject");

        requestForum(`tutorial?term=${subject}${tagsParameter}&token=${conf.get("forumLink.token")}`, "GET")
            .then(body => {
                if (body.message === "No result") {
                    interaction.reply({
                        embeds: [{
                            color: ERROR_COLOR,
                            description: "Aucun résultat ne correspond à votre recherche"
                        }]
                    });
                } else {
                    const embed = new EmbedBuilder();
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

                    let embedSize: number = (embed.data.title as string).length;
                    for (let i = 0; i < prefixArray.length; i++) {
                        embedSize += prefixArray[i].length + fieldContent[i].length;
                    }

                    if (prefixArray.length >= 25 || embedSize >= 6000) { // TODO Change for use bouton
                        interaction.reply({
                            embeds: [{
                                description: "Votre recherche renvoie trop de résulats.",
                                color: ERROR_COLOR
                            }]
                        });
                    } else {
                        for (let i = 0; i < prefixArray.length; i++) {
                            embed.addFields({name: prefixArray[i], value: fieldContent[i]});
                        }
                        interaction.reply({embeds: [embed]});
                    }
                }
            });
    }
};
