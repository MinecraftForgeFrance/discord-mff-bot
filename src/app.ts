import Conf = require("conf");
import { Client, TextChannel, Message, Guild, GuildChannel } from "discord.js";
import { createLogger, Logger } from "winston";
import { PingCommand } from "./commands/PingCommand";
import { schema } from "./config/config";
import { options } from "./logging/LogOptions";
import { StringReader } from "./parser/StringReader";
import { DiscAccess, UsersManager, QuerySession } from "./user/UsersManager";
import { UserInfo } from "./user/UserInfo";
import { Shoutbox } from "./shoutbox/Shoutbox";
import { RegisterCommand } from "./commands/RegisterCommand";
import { StopCommand } from "./commands/StopCommand";
import { CommandsDispatcher } from "./commands/CommandsDispatcher";
import { CommandContext } from "./commands/CommandContext";
import { ResetCommand } from "./commands/ResetCommand";
import { HelpCommand } from "./commands/HelpCommand";
import { EventsCommand } from "./commands/EventsCommand";
import { TutorialCommand } from "./commands/TutorialCommand";
import { ModHelpCommand } from "./commands/ModHelpCommand";

const logger: Logger = createLogger(options);
if(process.argv.indexOf("--debug") !== -1) {
    logger.level = "debug";
}

const conf = new Conf<any>({
    configName: "bot-config",
    cwd: "./dist/config",
    schema,
});

const shoutbox: Shoutbox = new Shoutbox(conf, logger);

const client = new Client();
const usersManager = new UsersManager(new DiscAccess());
const commandsDispatcher = new CommandsDispatcher(usersManager, logger);
registerAllCommands();

client.on("ready", () => {
    logger.info("Discord client ready !");
});

const commandsPrefix: string = conf.get("commandPrefix");

client.on("message", (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content.indexOf(commandsPrefix) === 0) {
        const ctx: CommandContext = new CommandContext(
            new StringReader(message.content.substring(commandsPrefix.length).trim()),
            client,
            message,
            conf,
            logger,
        );
        commandsDispatcher.dispatchCommand(message.author.id, ctx);
    }

    // Shoutbox message handling
    if(message.channel.type === "text" && (message.channel as TextChannel).name === conf.get('channels.shoutbox')) {
        const querySession: QuerySession = usersManager.beginSession();
        const sender: UserInfo = querySession.getUser(message.author.id);
        shoutbox.bridgeMessage(sender, message, querySession);
    }

});

client.on("guildMemberAdd", (member) => {
    if(!member.user.bot) {
        member.send({
            embed: {
                description: `Bonjour ${member.displayName} sur le serveur Discord de Minecraft Forge France. 
                Veuillez vous enregistrer pour acquérir des droits sur le serveur. Tapez \`${commandsPrefix}register\` pour en savoir plus.`,
                color: 0x66FF
            }
        })
        .then((message: Message) => logger.debug(`Sent welcome embed to ${member.user.username}@${member.user.id}`))
        .catch((err) => logger.error(`Error while sending welcome embed to ${member.user.username}@${member.user.id} : ${err}`));
    }
});

client.on("guildMemberRemove", (member) => {
    if(!member.user.bot) {
        const guild: Guild = client.guilds.first();
        const logsChannels: GuildChannel = guild.channels.find("name", conf.get("channels.logs"));
        (logsChannels as TextChannel).send({
            embed: {
                description: `${member.displayName} a quitté le serveur`,
                color: 0xFF0000
            }
        });
    }
});

client.on("debug", (info: string) => logger.debug(info));

function registerAllCommands() {
    commandsDispatcher.registerCommand(new HelpCommand(commandsDispatcher));
    commandsDispatcher.registerCommand(new PingCommand());
    commandsDispatcher.registerCommand(new RegisterCommand());
    commandsDispatcher.registerCommand(new StopCommand());
    commandsDispatcher.registerCommand(new ResetCommand());
    commandsDispatcher.registerCommand(new EventsCommand());
    commandsDispatcher.registerCommand(new TutorialCommand());
    commandsDispatcher.registerCommand(new ModHelpCommand());
}

client.login(conf.get("application.token")).catch((err) => {
    logger.error("Unable to login to the application.");

    const token: string = conf.get("application.token");
    if(token.length === 0) {
        logger.error("The application token is empty. It's certainly the problem.");
    }
    logger.error(err);
    process.exit(1);
});