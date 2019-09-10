import {expect} from "chai";
import {IntArgument} from "../src/parser/ArgumentType";
import {StringReader} from "../src/parser/StringReader";

describe("IntArgument", () => {
    describe("#parse()", () => {
        const arg: IntArgument = new IntArgument();

        it("Correctly parse positive integer", () => {
            const reader: StringReader = new StringReader("12");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(12);
            expect(reader.getCursor()).to.equal(2);
        });

        it("Correctly parse negative integer", () => {
            const reader: StringReader = new StringReader("-45");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(-45);
            expect(reader.getCursor()).to.equal(3);
        });

        it("Don't parse floating number.", () => {
            const reader: StringReader = new StringReader("56.02");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.be.undefined;
            expect(reader.getCursor()).to.equal(0);
        });

        it("Stop parsing after first space.", () => {
            const reader: StringReader = new StringReader("7485 hello world");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(7485);
            expect(reader.getCursor()).to.equal(5);
        });

    });
});
