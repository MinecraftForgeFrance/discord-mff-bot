export class UserInfo {

     private discordId: string = '';
     private pseudo: string | null = null;
     private banned: boolean = false;

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
        else
            this.banned = false;

        // this.pseudo
        if(parsed.pseudo)
            this.pseudo = parsed.pseudo;
        else
            this.pseudo = null;
     }

     /**
      * @returns the id of the user on Discord
      */
     public getDiscordId(): string {
         return this.discordId;
     }

     /**
      * @returns the pseudo of the user on the forum. Can be null if the user isn't registered
      */
     public getPseudo(): string | null {
         return this.pseudo;
     }

     public isBanned(): boolean {
         if(this.banned)
            return true;
        return false;
     }

     public setBanned(banned: boolean): void {
         this.banned = banned;
     }

     public setPseudo(pseudo: string): void {
         this.pseudo = pseudo;
     }

}