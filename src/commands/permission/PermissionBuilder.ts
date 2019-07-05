import { PermissionCheck } from "../Command";
import { PermissionResolvable, TextChannel, Guild, GuildMember } from "discord.js";

export class PermissionBuilder {

    private checker: PermissionCheck = () => true;

    public static new(): PermissionBuilder {
        return new PermissionBuilder();
    }

    public hasPermission(permission: PermissionResolvable): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            if(ctx.getMessage().member) {
                return check(sender, ctx) && ctx.getMessage().member.hasPermission(permission);
            } else {
                const guild: Guild = ctx.getDiscordClient().guilds.first();
                const member: GuildMember = guild.member(ctx.getMessage().author);
                return check(sender, ctx) && member && member.hasPermission(permission);
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

    public channelNameIs(name: string): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            return check(sender, ctx) && ctx.getMessage().channel.type === 'text' && (ctx.getMessage().channel as TextChannel).name === name;
        };
        return this;
    }

    public hasRole(role: string): PermissionBuilder {
        const check = this.checker;
        this.checker = (sender, ctx) => {
            return check(sender, ctx) && ctx.getMessage().member && ctx.getMessage().member.roles.has(role);
        };
        return this;
    }

    public build(): PermissionCheck {
        return this.checker;
    }

}