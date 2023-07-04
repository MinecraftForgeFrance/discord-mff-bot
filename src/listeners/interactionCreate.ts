import {ChatInputCommandInteraction, Client, Events} from "discord.js";
import {logger} from "../app.js";
import {GlobalCommands} from "../commands/Command.js";

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
    try {
        await slashCommand.run(client, interaction);
    } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
};
