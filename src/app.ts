import Conf = require("conf");
import fs = require("fs");
import moment = require("moment");
import {Client, Message, TextChannel, User} from "discord.js";
import {createLogger, Logger} from "winston";
import {PingCommand} from "./commands/PingCommand";
import {schema} from "./config/config";
import {options} from "./logging/LogOptions";
import {StringReader} from "./parser/StringReader";
import {DiscAccess, QuerySession, UsersManager} from "./user/UsersManager";
import {UserInfo} from "./user/UserInfo";
import {Shoutbox} from "./shoutbox/Shoutbox";
import {RegisterCommand} from "./commands/RegisterCommand";
import {RuleCommand} from "./commands/RuleCommand";
import {StopCommand} from "./commands/StopCommand";
import {CommandsDispatcher} from "./commands/CommandsDispatcher";
import {CommandContext} from "./commands/CommandContext";
import {ResetCommand} from "./commands/ResetCommand";
import {HelpCommand} from "./commands/HelpCommand";
import {EventsCommand} from "./commands/EventsCommand";
import {TutorialCommand} from "./commands/TutorialCommand";
import {ModHelpCommand} from "./commands/ModHelpCommand";
import {addMemberRole, INFO_COLOR, memberLeave} from "./util/util";
import {BanCommand} from "./commands/BanCommand";

const logger: Logger = createLogger(options);
if (process.argv.indexOf("--debug") !== -1) {
    logger.level = "debug";
}

const conf = new Conf<any>({
    configName: "bot-config",
    cwd: "./config",
    schema,
});

const shoutbox: Shoutbox = new Shoutbox(conf, logger);

const client = new Client();
const usersManager = new UsersManager(new DiscAccess());
const commandsDispatcher = new CommandsDispatcher(usersManager, logger);
registerAllCommands();

let isNewYear = true;

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
    if (message.channel.type === "text" && (message.channel as TextChannel).name === conf.get('channels.shoutbox')) {
        const querySession: QuerySession = usersManager.beginSession();
        const sender: UserInfo = querySession.getUser(message.author.id);
        shoutbox.bridgeMessage(sender, message, querySession);
    }

});

client.on("guildMemberAdd", (member) => {
    if (!member.user.bot) {
        const querySession: QuerySession = usersManager.beginSession();
        const sender: UserInfo = querySession.getUser(member.user.id);
        const forumId = sender.getForumId();
        usersManager.endSession(querySession);
        if (forumId != null) {
            addMemberRole(client, conf, member.user)
                .then((member) => logger.info(`${member.user.username}@${member.id} became member after registration`))
                .catch((reason) => logger.error(`Unable to promote ${member.user.username}@${member.user.id} to member. Cause : ${reason}`));
        } else {
            member.send({
                embed: {
                    description: `Bonjour ${member.displayName} sur le serveur Discord de Minecraft Forge France.
                    Veuillez vous enregistrer pour acquérir des droits sur le serveur. Tapez \`${commandsPrefix}register\` pour en savoir plus.`,
                    color: INFO_COLOR
                }
            })
                .then(() => logger.debug(`Sent welcome embed to ${member.user.username}@${member.user.id}`))
                .catch((err) => logger.error(`Error while sending welcome embed to ${member.user.username}@${member.user.id} : ${err}`));
        }
    }
});

client.on("guildMemberRemove", (member) => {
    if (!member.user?.bot) {
        memberLeave(client, conf, member.user as User, logger);
    }
});

client.on("guildBanAdd", (_, user) => {
    const session = usersManager.beginSession();
    const info = session.getUser(user.id);
    if (!info.isBanned()) {
        info.setBanned(true);
        info.setBannedUntil(-1);
    }
    usersManager.endSession(session);
});

client.on("guildBanRemove", (_, user) => {
    const session = usersManager.beginSession();
    const info = session.getUser(user.id);
    if (info.isBanned()) {
        info.setBanned(false);
    }
    usersManager.endSession(session);
});

// Executes every minutes
client.setInterval(() => {
    if (fs.existsSync("data/users")) {
        fs.readdir("data/users", (err, files) => {
            if (!err) {
                const session = usersManager.beginSession();
                files.forEach((file) => {
                    const id = file.substring(0, file.length - ".json".length);
                    const info = session.getUser(id);
                    if (info.isBanned() && info.isBannedUntil() > 0 && info.isBannedUntil() < Date.now()) {
                        info.setBanned(false);
                        client.guilds.cache.first()?.members.unban(id)
                            .catch((unbanErr) => logger.error(`Can't unbanned ${id} : ${unbanErr}`))
                            .then(() => logger.info(`Unbanned user ${id}`));
                    }
                });
                usersManager.endSession(session);
            } else {
                logger.error(`Error while fetching 'data/users' dir content : ${err}`);
            }
        });
    }
}, conf.get("ban.unbanInterval"));

client.setInterval(() => {
    moment.locale("fr");
    const newYear = moment().set({hour: 0, minute: 0, second: 0, date: 1, month: 0, year: 2019});
    const now = moment();
    if (now >= newYear && !isNewYear) {
        isNewYear = true;
        const channel = client.channels.cache.find(value => (value as TextChannel).name === "annonces") as TextChannel;
        channel.send(`@everyone\n\nL'équipe de Minecraft Forge France vous souhaite une bonne année ${now.format("YYYY")} !`)
            .then(async (message: Message) => logger.info(`Send message : ${message.content}`))
            .catch(console.error);

    }
}, 1_000);

client.on("error", (error) => logger.error(error));

client.on("warn", (warn: string) => logger.warn(warn));

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
    commandsDispatcher.registerCommand(new BanCommand());
    commandsDispatcher.registerCommand(new RuleCommand());
}

client.login(conf.get("application.token")).catch((err) => {
    logger.error("Unable to login to the application.");

    const token: string = conf.get("application.token");
    if (token.length === 0) {
        logger.error("The application token is empty. It's certainly the problem.");
    }
    logger.error(err);
    process.exit(1);
});
