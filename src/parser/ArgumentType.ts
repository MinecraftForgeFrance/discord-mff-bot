import { StringReader } from "./StringReader";
import moment = require("moment");
import { UserInfo } from "../user/UserInfo";
import { QuerySession } from "src/user/UsersManager";
import { MessageMentions } from "discord.js";

interface ArgumentType<T> {

    parse(reader: StringReader): T | undefined;

}

class IntArgument implements ArgumentType<number> {

    public parse(reader: StringReader): number | undefined {
        const start = reader.getCursor();
        let space_less: string = "";
        while (reader.canRead() && reader.peek() != " ")
        {
            space_less += reader.read();
        }

        // We want to consume space after string
        if (reader.canRead() && reader.peek() == ' ') {
            reader.read();
        }

        const converted: number = Number(space_less);
        if (Number.isInteger(converted)) {
            return converted;
        } else {
            reader.setCursor(start);
            return undefined;
        }
    }
}

class WordArgument implements ArgumentType<string> {

    constructor(private predicate: WordChecker = (word) => word.length > 0) {}

    public parse(parser: StringReader): string | undefined {
        const start = parser.getCursor();
        let word: string = "";
        while (parser.canRead() && parser.peek() != " ") {
            word += parser.read();
        }

        if (parser.canRead() && parser.peek() == " ") {
            parser.read();
        }

        if (this.predicate(word)) {
            return word;
        } else {
            parser.setCursor(start);
            return undefined;
        }
    }
}

class AllRemainingArgument implements ArgumentType<string> {

    constructor(private predicate: WordChecker = (sentence: string) => sentence.length > 0) {}

    parse(reader: StringReader): string | undefined {
        const start: number = reader.getCursor();
        const length: number = reader.getRemainingCharacters();
        const sentence: string = reader.read(length);
        if (this.predicate(sentence))  {
            return sentence;
        } else {
            reader.setCursor(start);
            return undefined;
        }
    }
}

class VersionArgument extends WordArgument {

    constructor() {
        super((word: string) => word.match(/^\d+(?:\.\d+)*(?:\.x)?$/) !== null);
    }

}

class DurationArgument implements ArgumentType<moment.Duration> {

    static DURATION_REGEX: RegExp = /^(?:(?:(?<year>\d+)y)?(?:(?<month>\d+)M)?(?:(?<day>\d+)d)?(?:(?<hour>\d+)h)?(?:(?<minute>\d+)m)?(?:(?<second>\d+)s)?)|(?:(?<timestamp>\d+)t)$/;

    private wordParser: WordArgument = new WordArgument((word: string) => {
        const result = DurationArgument.DURATION_REGEX.exec(word);
        return result !== null && result.groups !== undefined && Object.values(result.groups).map(s => s !== undefined).reduce((prev, next) => prev || next);
    });

    parse(reader: StringReader): moment.Duration | undefined {
        const result: string | undefined = this.wordParser.parse(reader);
        if (result) {
            const match: RegExpExecArray | null = DurationArgument.DURATION_REGEX.exec(result);
            if (match && match.groups) {
                const groups: { [key: string]: string } = match.groups;
                let duration: moment.Duration = moment.duration(0, "ms");
                if (groups.timestamp) {
                    duration = duration.add(Number(groups.timestamp), "ms");
                } else {
                    if (groups.year) {
                        duration.add(Number(groups.year), "year");
                    }
                    if (groups.month) {
                        duration.add(Number(groups.month), "month");
                    }
                    if (groups.day) {
                        duration.add(Number(groups.day), "day");
                    }
                    if (groups.hour) {
                        duration.add(Number(groups.hour), "hour");
                    }
                    if (groups.minute) {
                        duration.add(Number(groups.minute), "minute");
                    }
                    if (groups.second) {
                        duration.add(Number(groups.second), "second");
                    }
                }
                return duration;
            }
        }
        return undefined;
    }

}

class UserArgument implements ArgumentType<UserInfo> {

    constructor(private querySession: QuerySession) {}

    parse(reader: StringReader): UserInfo | undefined {
        const mention: string | undefined = new WordArgument(word => MessageMentions.USERS_PATTERN.test(word)).parse(reader);
        if (mention) {
            const id = (/[0-9]+/.exec(mention) as RegExpExecArray)[0];
            return this.querySession.getUser(id);
        }
        return undefined;
    }
}

type WordChecker = (word: string) => boolean;

export {
    IntArgument,
    WordArgument,
    WordChecker,
    ArgumentType,
    AllRemainingArgument,
    VersionArgument,
    DurationArgument,
    UserArgument
};
