import { ChatInputCommandInteraction, Client } from 'discord.js';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { Command } from './Command.js';
import { INFO_COLOR } from '../util/util.js';

export const PingCommand: Command = {
    name: 'ping',
    description: 'Affiche le temps de latence entre la commande et la réponse du bot',
    type: ApplicationCommandType.ChatInput,
    run: async (_: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply({
            embeds: [{
                color: INFO_COLOR,
                description: `:ping_pong: Pong: \`${Date.now() - interaction.createdTimestamp} ms\``
            }]
        });
    }
};
