
export class UserInfo {

    private readonly discordId: string = '';
    private forumId: number | null = null;
    private registrationToken: string | undefined;

    constructor(jsonStr: string) {
        const parsed: UserInfo = JSON.parse(jsonStr);
        // this.discordId
        if (parsed.discordId) {
            this.discordId = parsed.discordId;
        }
        else {
            throw Error("Field 'discordId' must be specified.");
        }

        // this.forumId
        if (parsed.forumId) {
            this.forumId = parsed.forumId;
        }
        else {
            this.forumId = null;
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
     * Sets the token the user will receive on the forum
     */
    public setRegistrationToken(token: string): void {
        this.registrationToken = token;
    }

    public getRegistrationToken(): string | undefined {
        return this.registrationToken;
    }

    public setForumId(forumId: number): void {
        this.forumId = forumId;
    }
}
