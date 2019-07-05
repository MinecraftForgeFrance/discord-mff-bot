export class UserInfo {

     private discordId: string = '';
     private forumId: string | null = null;
     private banned: boolean = false;
     private registrationStep: number = 0;
     private registrationToken: number | undefined;

     constructor(jsonStr: string) {
         const parsed: UserInfo = JSON.parse(jsonStr);

         // this.discordId
         if(parsed.discordId)
            this.discordId = parsed.discordId;
        else
            throw Error("Field 'discordId' must be specified.");

        // this.banned
        if(parsed.banned)
            this.banned = true;

        // this.forumId
        if(parsed.forumId)
            this.forumId = parsed.forumId;
        else
            this.forumId = null;

        // this.registrationStep
        if(parsed.registrationStep !== undefined)
            this.registrationStep = parsed.registrationStep

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
     public getForumId(): string | null {
         return this.forumId;
     }

     /**
      * Sets the token the user will receive on the forum
      */
     public setRegistrationToken(token: number): void {
        this.registrationToken = token;
     }

     public getRegistrationToken(): number | undefined {
         return this.registrationToken;
     }

     public setRegistrationStep(step: number): void {
         this.registrationStep = step;
     }

     public isBanned(): boolean {
         if(this.banned)
            return true;
        return false;
     }

     public setBanned(banned: boolean): void {
         this.banned = banned;
     }

     public setForumId(forumId: string): void {
         this.forumId = forumId;
     }

     public getRegistrationStep(): number {
         return this.registrationStep;
     }

}