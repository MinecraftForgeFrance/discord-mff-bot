class StringReader {

    private cursor: number;
    private total_length: number;

    constructor(private arg: string) {
        this.cursor = 0;
        this.total_length = arg.length;
    }

    /**
     * Gets the given count of characters from the no-parsed part of the arg-string.
     * If the requested count of characters exceeds the length of the arg-string, then
     * the returned string is smaller than the requested one.
     * 
     * The pooled characters will move the cursor.
     * 
     * Subsequent call to this method (with same arg) won't return the same result.
     * 
     * Calling this method with no argument will result in polling next character.
     * 
     * @see peek
     * @param count The count of characters to get
     * @returns a string with a length from 0 to the given count
     */
    public read(count: number = 1): string {
        let start = this.cursor;
        this.cursor = Math.min(this.total_length, this.cursor + count);
        return this.arg.substr(start, this.cursor - start);
    }

    /**
     * Gets the given count of characters from the no-parsed part of the arg-string.
     * If the requested count of characters exceeds the length of the arg-string, then
     * the returned string is smaller than the requested one.
     * 
     * Subsequent call to this method (with same arg) will return the same result.
     * 
     * Calling this method with no argument will result in peeking next character.
     * 
     * @see pool
     * @param count The count of characters to get
     * @returns a string with a length from 0 to the given count
     */
    public peek(count: number = 1): string {
        return this.arg.substr(this.cursor, Math.min(this.total_length - this.cursor, count));
    }

    /**
     * Calling this method without arguments will result as checking if the parser can read
     * on more character.
     * @param count The count of characters the parser would read
     * @returns true if the parser can read the given count of characters, else false
     */
    public canRead(count: number = 1): boolean {
        return this.total_length - this.cursor >= count;
    }

    public getCursor(): number {
        return this.cursor;
    }

    public setCursor(index: number): void {
        this.cursor = Math.min(this.total_length, index);
    }

    public getRemainingCharacters(): number {
        return this.total_length - this.cursor;
    }

}

export {
    StringReader
}