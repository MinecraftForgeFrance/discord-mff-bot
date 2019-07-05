import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "../commands/CommandContext";
import request = require("request");
import { IntArgument } from "../parser/ArgumentType";

export abstract class RegistrationStep {

    public abstract executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void;

    public abstract getUsage(sender: UserInfo, ctx: CommandContext): string;

}

export class FetchPseudoStep extends RegistrationStep {

    public executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void {
        const pseudo: string = ctx.getReader().read(ctx.getReader().getRemainingCharacters()).trim();
        
        if(pseudo.length === 0) {
            reject();
            return;
        }

        const config = ctx.getConfig();
        // Requests token and user id to forum
        request({
            uri: `${config.get("forumLink.protocol")}://${config.get("forumLink.hostname")}:${config.get("forumLink.port")}/discordapi/register`,
            method: "POST",
            json: {
                username: pseudo,
                token: config.has("forumLink.token"),
            }
        }, (err, res, body) => {
            if(body) {
                if(body.error === "User not found") {
                    ctx.answer("Le pseudo que vous avez indiqué n'existe pas, essayez encore.");
                } else {
                    const token: number = body.result;
                    const userId: string = body.userId;
                    sender.setRegistrationToken(token);
                    sender.setForumId(userId);
                    ctx.answerEmbed({
                        description: "Vous avez reçu un message privé sur le forum contenant un code activation. Veuillez le récupérer et passer à la suite.",
                        color: 0xFF00,
                    });
                    nextStep();
                }
            } else if(err) {
                ctx.getLogger().error(`Error when requesting user id and auth token. Response code: ${res.statusCode}`);
                ctx.getLogger().error(err);
                ctx.answer("Une erreur est survenue en interrogeant le forum. Veillez réessayer plus tard.");
            }
            resolve();
        });
    }    
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<votre pseudo sur le forum>";
    }

}

export class ValidateTokenStep extends RegistrationStep {

    public executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void {
        const token: number = ctx.requiredArg(new IntArgument(), "code");
        if(token === sender.getRegistrationToken()) {
            ctx.answerEmbed({
                description: "Code valide !",
                color: 0xFF00,
            });
            nextStep();
        } else {
            ctx.answerEmbed({
                description: "Le code fourni ne correspond pas à celui envoyé par message privé sur le forum.",
                color: 0xFF0000,
            });
        }
        resolve();
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<code>";
    }


}