import Conf = require("conf");
import request = require("request");
import {Collection, GuildMember, Message, Snowflake} from "discord.js";
import {UserInfo} from "../user/UserInfo";
import {QuerySession} from "src/user/UsersManager";
import {Logger} from "winston";

export class Shoutbox {

    constructor(private config: Conf<unknown>, private logger: Logger) {
    }

    public bridgeMessage(sender: UserInfo, message: Message, session: QuerySession): void {

        if (!sender.getForumId()) {
            return;
        }

        const members: Collection<Snowflake, GuildMember> = message.mentions.members;

        let forwardedMessage: string = message.content;
        const mentions: Array<ShoutboxMention> = [];
        let removedLength = 0;

        members.array().forEach(member => {
            const memberInfo = session.getUser(member.id);
            if (memberInfo.getForumId()) {
                const result = new RegExp(`<@!?${memberInfo.getDiscordId()}>`).exec(forwardedMessage);
                if (result != null) {
                    forwardedMessage = forwardedMessage.substring(0, result.index) + forwardedMessage.substr(result.index + result[0].length);
                    mentions.push({
                        id: memberInfo.getForumId() as number,
                        index: result.index + removedLength
                    });
                    removedLength += result[0].length;
                }
            }
        });

        request({
            uri: `${this.config.get("forumLink.protocol")}://${this.config.get("forumLink.hostname")}:${this.config.get("forumLink.port")}/discordapi/sendshout`,
            method: "POST",
            json: {
                senderId: sender.getForumId(),
                token: this.config.get("forumLink.token"),
                message: forwardedMessage,
                mentions
            }
        }, (err, res, body) => {
            if (err) {
                this.logger.error(`Error while requesting shoutbox endpoint. Response code ${res.statusCode}. ${err}`);
                this.logger.error(body);
            }
        });

    }

}

interface ShoutboxMention {
    id: number;
    index: number;
}
