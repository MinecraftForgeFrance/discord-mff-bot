import { IntArgument } from '../src/parser/ArgumentType';
import { StringReader } from '../src/parser/StringReader';
const expect = require('chai').expect;

describe('IntArgument', function() {
    describe('#parse()', function() {
        const arg: IntArgument = new IntArgument();

        it('Correctly parse positive integer', function() {
            const reader: StringReader = new StringReader("12");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(12);
            expect(reader.getCursor()).to.equal(2);
        });

        it('Correctly parse negative integer', function() {
            const reader: StringReader = new StringReader("-45");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(-45);
            expect(reader.getCursor()).to.equal(3);
        });

        it("Don't parse floating number.", function() {
            const reader: StringReader = new StringReader("56.02");
            const value: number | undefined = arg.parse(reader);

            expect(value).to.be.undefined;
            expect(reader.getCursor()).to.equal(0);
        })

        it("Stop parsing after first space.", function() {
            const reader: StringReader = new StringReader('7485 hello world');
            const value: number | undefined = arg.parse(reader);

            expect(value).to.equal(7485);
            expect(reader.getCursor()).to.equal(5);
        });

    });
});