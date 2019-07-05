import Conf = require("conf");
import { Message, Collection, Snowflake, GuildMember } from "discord.js";
import { UserInfo } from "../user/UserInfo";
import { QuerySession } from "src/user/UsersManager";
import request = require("request");
import { Logger } from "winston";

export class Shoutbox {

    constructor(private config: Conf<unknown>, private logger: Logger) {}

    public bridgeMessage(sender: UserInfo, message: Message, session: QuerySession): void {

        if(!sender.getForumId()) {
            return;
        }

        const members: Collection<Snowflake, GuildMember> = message.mentions.members;

        let forwardedMessage: string = message.content;
        let mentions: Array<string> = [];

        members.array().forEach(member => {
            let memberInfo : UserInfo = session.getUser(member.id);
            if(memberInfo.getForumId()) {
                forwardedMessage = forwardedMessage.replace(`<@${memberInfo.getDiscordId()}>`, `<@${memberInfo.getForumId()}>`);
                mentions.push(memberInfo.getForumId() as string);
            }
        });

        request({
            uri: `${this.config.get("forumLink.protocol")}://${this.config.get("forumLink.hostname")}:${this.config.get("forumLink.port")}/discordapi/sendshout`,
            method: "POST",
            json: {
                username: sender.getForumId(),
                token: this.config.get("forumLink.token"),
                message: forwardedMessage,
                mentions
            }
        }, (err, res, body)  => {
            if(err) {
                this.logger.error(`Error while requesting shoutbox endpoint. Response code ${res.statusCode}. ${err}`);
                this.logger.error(body);
            }
        });

    }

}