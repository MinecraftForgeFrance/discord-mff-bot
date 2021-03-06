import axios from "axios";
import { Logger } from "winston";
import Conf from "conf/dist/source";
import { Message } from "discord.js";

import { UserInfo } from "../user/UserInfo";
import { QuerySession } from "src/user/UsersManager";

export class Shoutbox {

    constructor(private config: Conf<any>, private logger: Logger) {
    }

    public bridgeMessage(sender: UserInfo, message: Message, session: QuerySession): void {
        if (!sender.getForumId()) {
            return;
        }

        axios.post(`${this.config.get("forumLink.protocol")}://${this.config.get("forumLink.hostname")}:${this.config.get("forumLink.port")}/discordapi/sendshout`, {
            senderId: sender.getForumId(),
            token: this.config.get("forumLink.token"),
            message: message.content,
            mentions: message.mentions.members ? message.mentions.members .map(member => session.getUser(member.id).getForumId()) : []
        }, {
            responseType: 'json'
        }).catch(error => {
            this.logger.error("Error while requesting shoutbox endpoint.", error);
        });
    }
}
