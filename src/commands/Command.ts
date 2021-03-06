import {UserInfo} from "../user/UserInfo";
import {CommandContext} from "./CommandContext";
import {QuerySession} from "../user/UsersManager";

export abstract class Command {

    protected constructor(private permission: PermissionCheck) {}

    public abstract getName(): string;

    public abstract getDescription(): string;

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
     * @param querySession the query session for this command
     * @param resolve function to call once you finished performing the command
     * @param reject function to call in case of error
     */
    public abstract perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void;

    /**
     * Checks whether the given sender can use the command.
     *
     * @param sender the user who fired the command
     * @param ctx the context for this command
     */
    public checkPermission(sender: UserInfo, ctx: CommandContext): boolean {
        return this.permission(sender, ctx);
    }

    /**
     * Indicates if this command should be displayed in the help message when help command
     * is fired. Default behavior is to display the command only if the user has the permission to
     * execute it in the given context.
     *
     * @param sender the user who fired the help command
     * @param ctx the context the help command has been fired
     */
    public shouldDisplayInHelp(sender: UserInfo, ctx: CommandContext): boolean {
        return this.checkPermission(sender, ctx);
    }

}

export type PermissionCheck = (sender: UserInfo, ctx: CommandContext) => boolean;
