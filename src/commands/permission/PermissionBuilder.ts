import {PermissionCheck} from "../Command";
import {PermissionResolvable, TextChannel} from "discord.js";

export class PermissionBuilder {

    private checker: PermissionCheck = () => true;

    public static new(): PermissionBuilder {
        return new PermissionBuilder();
    }

    public hasPermission(permission: PermissionResolvable): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            if (ctx.getMessage().member) {
                return check(sender, ctx) && ctx.getMessage().member?.hasPermission(permission) || false;
            } else {
                const guild = ctx.getDiscordClient().guilds.cache.first();
                const member = guild?.member(ctx.getMessage().author);
                return check(sender, ctx) && member && member.hasPermission(permission) || false;
            }
        };
        return this;
    }

    public channelTypeIs(type: 'dm' | 'group' | 'text' | 'voice' | 'category'): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            return check(sender, ctx) && ctx.getMessage().channel.type == type;
        };
        return this;
    }

    public channelNameIs(name: string, fromConfig: boolean = false): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            const channelName: string = fromConfig ? name : ctx.getConfig().get(`roles.${name}`);
            return check(sender, ctx) && ctx.getMessage().channel.type === 'text' && (ctx.getMessage().channel as TextChannel).name === channelName;
        };
        return this;
    }

    public hasRole(role: string, fromConfig: boolean = false): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            const roleName: string = fromConfig ? role : ctx.getConfig().get(`channels.${role}`);
            return check(sender, ctx) && ctx.getMessage().member && ctx.getMessage().member?.roles.cache.has(roleName) || false;
        };
        return this;
    }

    public build(): PermissionCheck {
        return this.checker;
    }

}
