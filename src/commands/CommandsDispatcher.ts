import {WordArgument} from "../parser/ArgumentType";
import {QuerySession, UsersManager} from "../user/UsersManager";
import {Logger} from "winston";
import {Command} from "./Command";
import {UserInfo} from "../user/UserInfo";
import {CommandContext} from "./CommandContext";
import {ERROR_COLOR} from "../util/util";

export class CommandsDispatcher {

    private commands: CommandsStorage = {};
    private commandNameParser: WordArgument = new WordArgument((v: string) => v.length !== 0);

    constructor(private usersManager: UsersManager, private logger: Logger) {
    }

    /**
     * Registers a command.
     *
     * @param command the command to register
     */
    public registerCommand(command: Command): void {
        if (this.commands[command.getName().toLowerCase()]) {
            this.logger.error(`Tried to register two commands with the name : ${command.getName().toLowerCase()}`);
            this.logger.error(`Those classes are ${typeof (this.commands[command.getName().toLowerCase()])} and ${typeof (command)}`);
            process.exit(2);
        } else {
            this.commands[command.getName().toLowerCase()] = command;
        }
    }

    /**
     * @returns all registered commands
     */
    public getCommands(): CommandsStorage {
        return this.commands;
    }

    /**
     * Dispatches the message sent by the user through command system.
     * It checks if the queried command exists and if so checks if the user
     * can use the command. If the user has the permission it then fire the command.
     *
     * @param userId the user trying to execute a command
     * @param ctx the context for this command
     */
    public dispatchCommand(userId: string, ctx: CommandContext): void {
        let commandName: string | undefined = ctx.optionalArg(this.commandNameParser);
        if (commandName) {
            commandName = commandName.toLowerCase();
            if (this.commands[commandName]) {
                const command: Command = this.commands[commandName];
                const querySession: QuerySession = this.usersManager.beginSession();
                const sender: UserInfo = querySession.getUser(userId);

                ctx.getLogger().debug(`User ${ctx.getMessage().author.username}@${userId} sent command ${commandName}`);

                if (command.checkPermission(sender, ctx)) {
                    new Promise<void>((resolve, reject) => {
                        try {
                            command.perform(sender, ctx, querySession, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }
                    })
                        .then(() => {
                            this.usersManager.endSession(querySession);
                        })
                        .catch((err) => {
                            if (typeof (err) === "object" && err.errorType === "argument") {
                                ctx.answerEmbed({
                                    description: `${err.message}
                                              Usage : \`${ctx.getConfig().get('commandPrefix')}${commandName} ${command.getUsage(sender, ctx)}\`
                                `,
                                    color: ERROR_COLOR
                                });
                            } else {
                                ctx.getLogger().error(`Error while performing command ${command.getName().toLowerCase()} : ${err}`);
                                ctx.answerEmbed({
                                    description: "Une erreur est survenue pendant l'exécution de la commande. Contactez un administrateur.",
                                    color: ERROR_COLOR
                                });
                            }
                            this.usersManager.endSession(querySession);
                        });
                } else {
                    if (ctx.getMessage().channel.type !== "dm") {
                        ctx.getMessage().delete()
                            .then((message) => ctx.getLogger().debug(`Deleted message ${message.id}`))
                            .catch((err: any) => ctx.getLogger().error(`Unable to delete message ${ctx.getMessage().id} : ${err}`));
                    }
                    ctx.answerPrivateEmbed({
                        description: "Vous n'avez pas la permission d'utiliser cette commande.",
                        color: ERROR_COLOR
                    });
                    this.usersManager.endSession(querySession);
                }
            } else {
                ctx.answer("La commande n'existe pas.");
            }
        }
    }
}

type CommandsStorage = { [id: string]: Command };
