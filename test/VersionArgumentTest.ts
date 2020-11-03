import { expect } from "chai";
import { StringReader } from "../src/parser/StringReader";
import { VersionArgument } from "../src/parser/ArgumentType";

describe("VersionArgument", () => {

    describe("#parse()", () => {

        it("Stops after after parsing version", () => {
            const reader: StringReader = new StringReader("1.12.2 I'm Jack");
            const arg: VersionArgument = new VersionArgument();
            const value: string | undefined = arg.parse(reader);

            expect(value).to.equal("1.12.2");
            expect(reader.getCursor()).to.equal(7);
        });

        it("Fails if the string doesn't match version format", () => {
            const reader: StringReader = new StringReader("Hello 1.4");
            const arg: VersionArgument = new VersionArgument();
            const value: string | undefined = arg.parse(reader);

            expect(reader.getCursor()).to.equal(0);
            expect(value).to.be.undefined;
        });

        it("Accepts 'x' wildcard at the end of the version", () => {
            const reader: StringReader = new StringReader("1.4.x George");
            const arg: VersionArgument = new VersionArgument();
            const value: string | undefined = arg.parse(reader);

            expect(value).to.equal("1.4.x");
            expect(reader.getCursor()).to.equal(6);
        });

    });

});
