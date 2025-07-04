import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags } from 'discord-api-types/v10';

import { logger } from '../app.js';
import { Command, handleApiResponse } from './Command.js';
import { conf } from '../config/config.js';
import {
    AVATAR_URL,
    ERROR_COLOR,
    EventResult,
    FORUM_URL,
    requestForum,
    ResponseData,
    SUCCESS_COLOR
} from '../util/util.js';

export const EventCommand: Command = {
    name: 'events',
    description: 'Allows you to consult the list of events provided by Forge',
    descriptionLocalizations: {
        fr: 'Permet de consulter la liste des événements fournis par Forge'
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
        }
    ],
    dmPermission: true,
    allowedChannels: [conf.get('channels.moddingSupport'), conf.get('channels.bot')],
    run: async (_: Client, interaction: ChatInputCommandInteraction) => {
        try {
            const subject = interaction.options.getString('subject', true);
            const response = await requestForum(`forgeevents?term=${subject}`, 'GET');
            await handleApiResponse<ResponseData<EventResult>>(response, interaction, async (responseData) => {
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
                    .setTitle('Liste des évènements correspondants à votre recherche')
                    .setThumbnail(AVATAR_URL);

                let embedSize = (embed.data.title as string).length;
                let fieldCount = 0;
                for (const [name, event] of Object.entries(data)) {
                    const description = event.description.length > 500 ? event.description.substring(0, 500) + ' ...' : event.description;

                    const fieldValue: string = `- **Package** : \`${event.package}\`\n
                    - **Description** : ${description}\n
                    [Pour plus d'info](${FORUM_URL}/forgeevents#${event.anchors})`;

                    if (fieldCount >= 25 || (embedSize + name.length + fieldValue.length) > 6000) {
                        await interaction.reply({
                            embeds: [{
                                color: ERROR_COLOR,
                                description: 'Votre recherche renvoie trop de résultats, merci de l\'affiner.'
                            }]
                        });
                    }

                    embed.addFields({ name, value: fieldValue });
                    embedSize += name.length + fieldValue.length;
                    fieldCount++;
                }

                await interaction.reply({ embeds: [embed] });
            });
        }
        catch (error) {
            logger.error('Error while processing events:', error);
            await interaction.reply({
                embeds: [{
                    color: ERROR_COLOR,
                    description: 'Une erreur est survenue lors du traitement de votre commande.'
                }],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
