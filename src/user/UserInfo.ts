export class UserInfo {

    private readonly discordId: string = '';
    private forumId: number | null = null;
    private banned: boolean = false;
    private bannedUntil: number = 0;
    private registrationStep: number = 0;
    private registrationToken: string | undefined;
    private counter: number = 0;
    private readonly javaQuestions: JavaQuestions = {answeredQuestions: []};

    constructor(jsonStr: string) {
        const parsed: UserInfo = JSON.parse(jsonStr);
        // this.discordId
        if (parsed.discordId) {
            this.discordId = parsed.discordId;
        } else {
            throw Error("Field 'discordId' must be specified.");
        }
        // this.banned
        if (parsed.banned) {
            this.banned = true;
        }
        // this.forumId
        if (parsed.forumId) {
            this.forumId = parsed.forumId;
        } else {
            this.forumId = null;
        }
        // this.registrationStep
        if (parsed.registrationStep !== undefined) {
            this.registrationStep = parsed.registrationStep;
        }
        // this.count
        if (parsed.counter !== undefined) {
            this.counter = parsed.counter;
        }
        // this.javaQuestions
        if (parsed.javaQuestions) {
            this.javaQuestions = parsed.javaQuestions;
        }
        // this.bannedUntil
        if (parsed.bannedUntil !== undefined) {
            this.bannedUntil = parsed.bannedUntil;
        }
        // this.registrationToken
        this.registrationToken = parsed.registrationToken;
    }

    /**
     * @returns the id of the user on Discord
     */
    public getDiscordId(): string {
        return this.discordId;
    }

    /**
     * @returns the id of the user on the forum. Can be null if the user isn't registered
     */
    public getForumId(): number | null {
        return this.forumId;
    }

    /**
     * Represents any counter that would be needed during registration such as remaining tries for token validation
     * or remaining questions for Java level confirmation.
     *
     * @return the value for the counter
     */
    public getCounter(): number {
        return this.counter;
    }

    /**
     * Sets a new value for the counter.
     *
     * @see #getCounter
     * @param value the new value for the counter
     */
    public setCounter(value: number): void {
        this.counter = value;
    }

    /**
     * Sets the token the user will receive on the forum
     */
    public setRegistrationToken(token: string): void {
        this.registrationToken = token;
    }

    public getRegistrationToken(): string | undefined {
        return this.registrationToken;
    }

    public setRegistrationStep(step: number): void {
        this.registrationStep = step;
    }

    public isBanned(): boolean {
        return this.banned;
    }

    public setBanned(banned: boolean): void {
        this.banned = banned;
    }

    public isBannedUntil(): number {
        return this.bannedUntil;
    }

    public setBannedUntil(timestamp: number) {
        this.bannedUntil = timestamp;
    }

    public setForumId(forumId: number): void {
        this.forumId = forumId;
    }

    public getRegistrationStep(): number {
        return this.registrationStep;
    }

    public getJavaQuestionsCat(): JavaQuestions {
        return this.javaQuestions;
    }

}

interface JavaQuestions {

    expectedAnswer?: number | undefined;
    answeredQuestions: Array<number>;
}
