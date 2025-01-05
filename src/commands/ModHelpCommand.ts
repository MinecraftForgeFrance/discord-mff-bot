import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } from 'discord.js';

import { logger } from '../app.js';
import { Command } from './Command.js';
import { conf } from '../config/config.js';
import { AVATAR_URL, ERROR_COLOR, isOk, requestForum, SUCCESS_COLOR } from '../util/util.js';

export const ModHelpCommand: Command = {
    name: 'modhelp',
    description: 'Displays the list of solved topics matching the search',
    descriptionLocalizations: {
        fr: 'Affiche la liste des sujets résolus correspondants à la recherche'
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
            description: 'The version to research for', // TODO : Add description is required
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
            const response = await requestForum(`solvedthread?term=${encodeURIComponent(subject)}${tagsParameter}&token=${conf.get('forumLink.token')}`, 'GET');
            if (!isOk(response)) {
                return interaction.reply({
                    embeds: [{
                        color: ERROR_COLOR,
                        description: response.message
                    }]
                });
            }

            const data = response.data;
            if (Object.keys(data).length === 0) {
                return interaction.reply({
                    embeds: [{
                        color: ERROR_COLOR,
                        description: 'Aucun résultat ne correspond à votre recherche.'
                    }]
                });
            }

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle('Liste des sujets résolus')
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
            })

            // Check for Discord embed size or field limits
            if (prefixArray.length >= 25 || embedSize >= 6000) { // TODO Change for use bouton
                return interaction.reply({
                    embeds: [{
                        color: ERROR_COLOR,
                        description: 'Votre recherche renvoie trop de résultats.'
                    }]
                });
            }

            prefixArray.forEach((tag, index) => {
                embed.addFields({ name: tag, value: fieldContent[index] });
            });

            return interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            logger.error('Error while processing modhelp:', error);
            return interaction.reply({
                embeds: [{
                    color: ERROR_COLOR,
                    description: 'Une erreur est survenue lors du traitement de votre commande.'
                }],
                flags: MessageFlags.Ephemeral
            });
        }

    }
}
