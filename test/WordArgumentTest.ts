import { WordArgument } from "../src/parser/ArgumentType";
import { StringReader } from "../src/parser/StringReader";
const expect = require('chai').expect;

describe('WordArgument', function() {

    describe('#parse()', function() {
    
        it("Parse first word and consume space after word", function() {
            const reader: StringReader = new StringReader('one two three');
            const arg: WordArgument = new WordArgument();
            const value: string | undefined = arg.parse(reader);

            expect(value).to.equal("one");
            expect(reader.getCursor()).to.equal(4);
        });

        it("Fail if the WordChecker rejects the parsed word.", function() {
            const reader: StringReader = new StringReader("once upon a time");
            const arg: WordArgument = new WordArgument((value: string) => value.indexOf('a') !== -1);
            const value: string | undefined = arg.parse(reader);

            expect(reader.getCursor()).to.equal(0);
            expect(value).to.be.undefined;
        });
        
    });

});