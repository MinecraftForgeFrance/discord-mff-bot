import {StringReader} from "src/parser/StringReader";
import {Client, Message, MessageEmbed, MessageEmbedOptions} from "discord.js";
import {Logger} from "winston";
import {ArgumentType} from "src/parser/ArgumentType";
import Conf = require("conf");

export class CommandContext {

    constructor(
        private reader: StringReader,
        private client: Client,
        private message: Message,
        private config: Conf<any>,
        private logger: Logger
    ) {
    }

    public getReader(): StringReader {
        return this.reader;
    }

    public getConfig(): Conf<any> {
        return this.config;
    }

    public getLogger(): Logger {
        return this.logger;
    }

    public getDiscordClient(): Client {
        return this.client;
    }

    public getMessage(): Message {
        return this.message;
    }

    /**
     * Answers the given message to the user. This message is sent as a dm.
     *
     * @param message the message to send to the user
     */
    public answerPrivate(message: string): void {
        this.message.author.send(message)
            .catch(err => this.logger.error(`Got error while sending private text message : ${err}`));
    }

    /**
     * Answers the given embed message to the user. This embed is sent as a dm.
     *
     * @param embed the embed message to send to the user
     */
    public answerPrivateEmbed(embed: MessageEmbed | MessageEmbedOptions): void {
        this.message.author.send({embed})
            .catch(err => this.logger.error(`Got error while sending private embed message : ${err}`));
    }

    /**
     * Answers the given message to the user. This message is sent in the same channel the user sent the command.
     *
     * @param message the message to send to the user
     */
    public answer(message: string): void {
        this.message.channel.send(message)
            .catch(err => this.logger.error(`Got error while sending text message : ${err}`));
    }

    /**
     * Answers the given embed message to the user. This message is sent in the same channel the user sent the command.
     *
     * @param embed the embed message to send to the user
     */
    public answerEmbed(embed: MessageEmbed | MessageEmbedOptions): void {
        this.message.channel.send({embed})
            .catch(err => this.logger.error(`Got error while sending embed message : ${err}`));
    }

    /**
     * Tries to parse an argument with the given argument type.
     *
     * @arg arg the type of argument to parse
     * @return the parsed value or undefined if no argument can be parsed
     */
    public optionalArg<T>(arg: ArgumentType<T>): T | undefined {
        return arg.parse(this.reader);
    }

    /**
     * Tries to parse an argument with the given argument type. If the argument can't be parsed, then throws an error.
     *
     * @param arg the type of argument to parse
     * @param name the argument name, only used to indicate the user which argument is missing (optional).
     * @return the parsed value
     */
    public requiredArg<T>(arg: ArgumentType<T>, name?: string | undefined): T {
        const value: T | undefined = arg.parse(this.reader);
        if (value) {
            return value;
        }
        if (name) {
            throw {
                errorType: "argument",
                message: `L'argument \`${name}\` est requis, mais n'est pas présent ou invalide.`
            };
        }
        throw {
            errorType: "argument",
            message: "Un argument requis n'est pas présent ou invalide."
        };
    }
}
