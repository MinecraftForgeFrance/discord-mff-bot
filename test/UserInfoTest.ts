import {expect} from "chai";
import {UserInfo} from "../src/user/UserInfo";

describe("UserInfo", () => {

    describe("Deserialization", () => {

        it("Retrieve information from json", () => {
            const jsonStr = `
                {
                    "discordId": "266241948824764416",
                    "banned": true,
                    "forumId": null
                }
            `;
            const info: UserInfo = new UserInfo(jsonStr);
            expect(info.getDiscordId()).to.equal("266241948824764416");
            expect(info.isBanned()).to.be.true;
            expect(info.getForumId()).to.be.null;
        });

        it("Allows missing field in json", () => {
            const jsonStr = `
                {
                    "discordId": "266241948824764416",
                    "forumId": "124"
                }
            `;
            const info: UserInfo = new UserInfo(jsonStr);
            expect(info.getDiscordId()).to.equal("266241948824764416");
            expect(info.isBanned()).to.be.false;
            expect(info.getForumId()).to.equal("124");
        });

        it("Must throw an error if 'discordId' field is missing", () => {
            expect(() => new UserInfo("{}")).to.throw("Field 'discordId' must be specified.");
        });

    });

});
