import { expect } from "chai";
import { StringReader} from "../src/parser/StringReader";

describe("StringReader", () => {
    describe("#read()", () => {

        it("Return shorter string if end of string is reached.", () => {
            let reader: StringReader = new StringReader("a");
            expect(reader.read(2)).to.equal("a");
            expect(reader.getCursor()).to.equal(1);
        });

        it("Read characters one by one and cursor is moved correctly.", () => {
            let reader: StringReader = new StringReader('Java');
            let result: string = reader.read();
            expect(reader.getCursor()).to.equal(1);

            result += reader.read();
            expect(reader.getCursor()).to.equal(2);

            result += reader.read();
            expect(reader.getCursor()).to.equal(3);

            result += reader.read();
            expect(reader.getCursor()).to.equal(4);

            expect(result).to.equal("Java");
        });

        it("Return the queried count of characters.", () => {
            let reader: StringReader = new StringReader("program");
            expect(reader.read(4)).to.equal("prog");
            expect(reader.getCursor()).to.equal(4);
        });

    });

    describe("#peek()", () => {

        it("Peeking a character don't change the reader state.", () => {
            let reader: StringReader = new StringReader("minecraft");
            reader.setCursor(2);

            let peek: string = reader.peek();

            expect(peek).to.equal("n");
            expect(reader.getCursor()).to.equal(2);
            expect(peek).to.equal(reader.peek());
        });

        it("Return shorter string if end of string is reached.", () => {
            let reader: StringReader = new StringReader("a");
            expect(reader.peek(2)).to.equal('a');
            expect(reader.getCursor()).to.equal(0);
        });

    });

    describe("#canRead()", () => {

        it("Correctly indicates if characters can be read.", () => {
            let reader: StringReader = new StringReader("jira");
            expect(reader.canRead()).to.equal(true);
            expect(reader.canRead(4)).to.equal(true);
            expect(reader.canRead(5)).to.equal(false);

            reader.setCursor(2);
            expect(reader.canRead(2)).to.equal(true);
            expect(reader.canRead(3)).to.equal(false);
        });

    });

    describe("#setCursor()", () => {

        it("Prevent the cursor to be placed after the end of the string.", () => {
            let reader: StringReader = new StringReader("forge");
            expect(reader.getCursor()).to.equal(0);

            reader.setCursor(2);
            expect(reader.getCursor()).to.equal(2);

            reader.setCursor(10);
            expect(reader.getCursor()).to.equal(5);
        });

    });

});