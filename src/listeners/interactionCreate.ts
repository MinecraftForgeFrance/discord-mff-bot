import { ChatInputCommandInteraction, Client, Events, MessageFlags } from 'discord.js';

import { logger } from '../app.js';
import { GlobalCommands } from '../commands/Command.js';

export default (client: Client): void => {
    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    const slashCommand = GlobalCommands.find(c => c.name === interaction.commandName);

    if (!slashCommand) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    if (interaction.guild && slashCommand.allowedChannels && !slashCommand.allowedChannels.includes(interaction.channelId)) {
        await interaction.reply({
            content: 'This command cannot be used in this channel.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        slashCommand.run(client, interaction);
    }
    catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            });
        }
        else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
