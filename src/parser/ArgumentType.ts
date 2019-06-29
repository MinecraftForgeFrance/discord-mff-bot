import { StringReader } from "./StringReader";

interface ArgumentType<T> {

    parse(reader: StringReader) : T | undefined

}

class IntArgument implements ArgumentType<number>
{

    public parse(reader: StringReader): number | undefined {
        let start = reader.getCursor();
        let space_less: string = "";
        while(reader.canRead() && reader.peek() != " ")
        {
            space_less += reader.read();
        }

        // We want to consume space after string
        if(reader.canRead() && reader.peek() == ' ')
            reader.read();
        
        let converted: number = Number(space_less);
        if(Number.isInteger(converted)) {
            return converted;
        } else {
            reader.setCursor(start);
            return undefined;
        }
    }
    
}

class WordArgument implements ArgumentType<string>
{

    constructor(private predicate: WordChecker = (word) => true) {}
    
    public parse(parser: StringReader): string | undefined {
        let start = parser.getCursor();
        let word: string = "";
        while(parser.canRead() && parser.peek() != " ")
        {
            word += parser.read();
        }

        if(parser.canRead() && parser.peek() == " ")
            parser.read();

        if(this.predicate(word)) {
            return word;
        } else {
            parser.setCursor(start);
            return undefined;
        }
    }
    
}

interface WordChecker {
    (word: string): boolean;
}

export {
    IntArgument,
    WordArgument,
    WordChecker,
    ArgumentType
}