import { ArgumentType, WordArgument } from "../parser/ArgumentType";
import { StringReader } from "../parser/StringReader";
import { UsersManager, QuerySession } from "../user/UsersManager";
import { UserInfo } from "../user/UserInfo";
import { Client, Message, RichEmbed, RichEmbedOptions, PermissionResolvable } from "discord.js";

export abstract class Command {

    constructor(private permission: PermissionCheck) {}

    public abstract getName(): string;

    public abstract getDescription() : string;

    /**
     * Returns the synthax for this command. This synthax will be displayed to the given
     * sender if an error is thrown will performing this command.
     * 
     * @param sender the user who fired the command
     * @param ctx the context for this command
     * @returns a string telling how to use the command
     */
    public abstract getUsage(sender: UserInfo, ctx: CommandContext): string;

    /**
     * Performs the actions the command is made for.
     * 
     * @param sender the user who fired the command
     * @param ctx the context for this command
     */
    public abstract perform(sender: UserInfo, ctx: CommandContext) : void;

    /**
     * Checks whether the given sender can use the command.
     * 
     * @param sender the user who fired the command
     * @param ctx the context for this command
     */
    public checkPermission(sender: UserInfo, ctx: CommandContext): boolean {
        return this.permission(sender, ctx);
    }

}

export class CommandsDispatcher {

    private commands: CommandsStorage = {};
    private commandNameParser: WordArgument = new WordArgument((v: string) => v.length !== 0);

    constructor(private usersManager: UsersManager) {}

    /**
     * Registers a command.
     * 
     * @param command the command to register
     */
    public registerCommand(command: Command): void {
        this.commands[command.getName().toLowerCase()] = command;
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
        const commandName: string | undefined = ctx.optionalArg(this.commandNameParser);
        if(commandName) {
            if(this.commands[commandName.toLowerCase()]) {
                const command: Command = this.commands[commandName.toLowerCase()];
                const querySession: QuerySession = this.usersManager.beginSession();
                const sender: UserInfo = querySession.getUser(userId);

                if(command.checkPermission(sender, ctx)) {
                    try {
                        command.perform(sender, ctx);
                    } catch(err) {
                        ctx.answer(command.getUsage(sender, ctx));
                    }
                } else {
                    ctx.answer("Vous n'avez pas la permission d'utiliser cette commande.");
                }

                this.usersManager.endSession(querySession);
            } else {
                ctx.answer("La commande n'existe pas.");
            }
        }
        
    }

}

interface PermissionCheck {
    (sender: UserInfo, ctx: CommandContext) : boolean
}

export class PermissionBuilder {

    private checker: PermissionCheck = (sender, ctx) => true;

    public static new(): PermissionBuilder {
        return new PermissionBuilder();
    }

    public hasPermission(permission: PermissionResolvable): void {
        this.checker = (sender, ctx) => {
            return this.checker(sender, ctx) && ctx.getMessage().member.hasPermission(permission);
        };
    }

    public inChannel(type: 'dm' | 'group' | 'text' | 'voice' | 'category'): void {
        this.checker = (sender, ctx) => {
            return this.checker(sender, ctx) && ctx.getMessage().channel.type == type;
        };
    }

    public hasRole(role: string): void {
        this.checker = (sender, ctx) => {
            return this.checker(sender, ctx) && ctx.getMessage().member.roles.has(role);
        };
    }

    public build(): PermissionCheck {
        return this.checker;
    }

}

interface CommandsStorage {
    [id: string]: Command;
}

export class CommandContext {

    constructor(
        private reader: StringReader,
        private client: Client,
        private message: Message
    ) {}

    public getReader(): StringReader {
        return this.reader;
    }

    public getDiscordClient(): Client {
        return this.client;
    }

    public getMessage(): Message {
        return this.message;
    }

    public answer(message: string): void {
        this.message.channel.send(message)
            .then(() => {})
            .catch(() => {});
    }

    public answerEmbed(embed: RichEmbed | RichEmbedOptions): void {
        this.message.channel.sendEmbed(embed)
                            .then(() => {})
                            .catch(() => {});
    }

    public optionalArg<T>(arg: ArgumentType<T>): T | undefined {
        return arg.parse(this.reader);
    }

    public requiredArg<T>(arg: ArgumentType<T>): T {
        const value: T | undefined = arg.parse(this.reader);
        if(value)
            return value;
        throw Error("Required arg can't be parsed.");
    }

}