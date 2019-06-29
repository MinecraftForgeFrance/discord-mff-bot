import { UserInfo } from "../src/user/UserInfo";
const expect = require('chai').expect;

describe('UserInfo', function() {

    describe('Deserialization', function() {

        it('Retrieve information from json', function() {
            const jsonStr = `
                {
                    "discordId": "266241948824764416",
                    "banned": true,
                    "pseudo": null
                }
            `;
            const info: UserInfo = new UserInfo(jsonStr);
            expect(info.getDiscordId()).to.equal('266241948824764416');
            expect(info.isBanned()).to.be.true;
            expect(info.getPseudo()).to.be.null;
        });

        it('Allows missing field in json', function() {
            const jsonStr = `
                {
                    "discordId": "266241948824764416",
                    "pseudo": "Jhon"
                }
            `;
            const info: UserInfo = new UserInfo(jsonStr);
            expect(info.getDiscordId()).to.equal('266241948824764416');
            expect(info.isBanned()).to.be.false;
            expect(info.getPseudo()).to.equal("Jhon");
        });

        it("Must throw an error if 'discordId' field is missing", function() {
             expect(() => new UserInfo('{}')).to.throw("Field 'discordId' must be specified.");
        });

    });

});