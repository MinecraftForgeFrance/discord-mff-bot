import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client } from 'discord.js';

import { PingCommand } from './PingCommand.js';
import { ModHelpCommand } from './ModHelpCommand.js';
import { TutorialCommand } from './TutorialCommand.js';
import { ApiResponse, ERROR_COLOR, isError } from '../util/util.js';

export interface Command extends ChatInputApplicationCommandData {
    allowedChannels?: string[];
    run: (client: Client, interaction: ChatInputCommandInteraction) => void;
}

export const GlobalCommands: Command[] = [
    PingCommand,
    TutorialCommand,
    ModHelpCommand
];
export const GuildCommands: Command[] = [];

export async function handleApiResponse<T>(response: ApiResponse, interaction: ChatInputCommandInteraction, onSuccess: (data: T) => Promise<void> | void): Promise<void> {
    if (isError(response)) {
        await interaction.reply({
            embeds: [{
                color: ERROR_COLOR,
                description: response.message
            }]
        });
    }
    else {
        await onSuccess(response as T);
    }
}
