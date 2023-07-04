import {Client, Events} from "discord.js";
import {GlobalCommands, GuildCommands} from "../commands/Command.js";
import {logger} from "../app.js";

export default (client: Client): void => {
    client.once(Events.ClientReady, async c => {
        if(!c.user || !c.application) return;
        await c.application.commands.set(GlobalCommands.concat(GuildCommands));
        logger.info(`Discord client ready ! Logged in a ${c.user.tag}`);
    });
};
