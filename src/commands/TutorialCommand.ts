import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import { logger } from '../app.js';
import { Command, handleApiResponse } from './Command.js';
import { conf } from '../config/config.js';
import { AVATAR_URL, ERROR_COLOR, requestForum, ResponseData, SUCCESS_COLOR } from '../util/util.js';

export const TutorialCommand: Command = {
    name: 'tutorial',
    nameLocalizations: {
        fr: 'tutoriel'
    },
    description: 'Displays the list of tutorials matching the search',
    descriptionLocalizations: {
        fr: 'Affiche la liste des tutoriels correspondants à la recherche'
    },
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'subject',
            nameLocalizations: {
                fr: 'sujet'
            },
            description: 'The subject to research for',
            descriptionLocalizations: {
                fr: 'Le sujet à rechercher'
            },
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'version',
            nameLocalizations: {
                fr: 'version'
            },
            description: 'This version to research for',
            descriptionLocalizations: {
                fr: 'La version à rechercher'
            },
            type: ApplicationCommandOptionType.String,
            required: false,
            /*choices: [
                {
                    name: "",
                    value: ""
                }
            ],*/
        }
    ],
    dmPermission: true,
    allowedChannels: [conf.get('channels.moddingSupport'), conf.get('channels.bot')],
    run: async (_: Client, interaction: ChatInputCommandInteraction) => {
        try {
            const subject = interaction.options.getString('subject', true);
            const version = interaction.options.getString('version', false);
            const tagsParameter = version ? `&hasTags[]=${version}` : '';

            const response = await requestForum(`tutorial?term=${encodeURIComponent(subject)}${tagsParameter}`, 'GET');

            await handleApiResponse<ResponseData>(response, interaction, async (responseData) => {
                const data = responseData.data;
                if (Object.keys(data).length === 0) {
                    await interaction.reply({
                        embeds: [{
                            color: ERROR_COLOR,
                            description: 'Aucun résultat ne correspond à votre recherche.'
                        }]
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle('Liste des tutoriels')
                    .setThumbnail(AVATAR_URL);

                const prefixArray: string[] = [];
                const fieldContent: string[] = [];
                for (const [tag, posts] of Object.entries(data)) {
                    for (const post of posts) {
                        const field: string = `- [${post.title}](${post.url})`;
                        if (!prefixArray.includes(tag)) {
                            prefixArray.push(tag);
                            fieldContent.push(field);
                        }
                        else {
                            const lastIndex = prefixArray.lastIndexOf(tag);
                            if (fieldContent[lastIndex].length <= (1024 - field.length)) {
                                fieldContent[lastIndex] += `\n${field}`;
                            }
                            else {
                                prefixArray.push(tag);
                                fieldContent.push(field);
                            }
                        }
                    }
                }

                let embedSize: number = (embed.data.title as string).length;
                prefixArray.forEach((tag, index) => {
                    embedSize += tag.length + fieldContent[index].length;
                });

                // Check for Discord embed size or field limits
                if (prefixArray.length >= 25 || embedSize >= 6000) { // TODO Change for use bouton
                    await interaction.reply({
                        embeds: [{
                            color: ERROR_COLOR,
                            description: 'Votre recherche renvoie trop de résultats.'
                        }]
                    });
                }

                prefixArray.forEach((tag, index) => {
                    embed.addFields({ name: tag, value: fieldContent[index] });
                });

                await interaction.reply({ embeds: [embed] });
            });
        }
        catch (error) {
            logger.error('Error while processing tutorial:', error);
            await interaction.reply({
                embeds: [{
                    color: ERROR_COLOR,
                    description: 'Une erreur est survenue lors du traitement de votre commande.'
                }]
            });
        }
    }
};
