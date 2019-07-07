import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "../commands/CommandContext";
import { IntArgument } from "../parser/ArgumentType";
import Conf = require("conf");
import assert = require("assert");
import { RichEmbed, Guild, Role } from "discord.js";
import { requestForum } from "../util/util";

export abstract class RegistrationStep {

    /**
     * This method is called when the user achieved the previous step.
     * 
     * @param sender the user who sent the command
     * @param ctx the context for this command
     */
    public enterStep(sender: UserInfo, ctx: CommandContext): void {}

    /**
     * Processes information given by the user to achieve the step, if possible. The function reject
     * should only be called if an error the user can't influence on occurs (file access denied, http connection fail, etc ...).
     * The function resolve is called when the command is called correctly (match command usage).
     * 
     * @param sender the user who sent the command
     * @param ctx the context for this command
     * @param resolve the function to call to tell everything executed correctly
     * @param reject the function to call to tell something went wrong
     * @param nextStep the function to call to start next step
     */
    public abstract executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void;

    /**
     * The usage for this step.
     * 
     * @param sender the user who sent the command
     * @param ctx the context for this command
     */
    public abstract getUsage(sender: UserInfo, ctx: CommandContext): string;

}

export class FetchPseudoStep extends RegistrationStep {

    public executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void {
        const pseudo: string = ctx.getReader().read(ctx.getReader().getRemainingCharacters()).trim();

        requestForum(ctx, "discordapi/register", "POST", {
                username: pseudo,
                token: ctx.getConfig().get("forumLink.token")
        })
        .catch(() => reject())
        .then((body: any) => {
            if(body.error === "User not found") {
                ctx.answerEmbed({
                    description: "Le pseudo que vous avez indiqué n'existe pas, essayez encore.",
                    color: 0xFF0000
                });
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
            resolve();
        });
    }    
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<votre pseudo sur le forum>";
    }

}

export class ValidateTokenStep extends RegistrationStep {

    public enterStep(sender: UserInfo, ctx: CommandContext): void {
        sender.setCounter(3);
    }

    public executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void {
        const token: number = ctx.requiredArg(new IntArgument(), "code");
        if(sender.getCounter() === 0) {
            ctx.answerEmbed({
                description: "Vous avez épuisé toute vos tentatives. Contactez un administrateur si nécessaire.",
                color: 0xFF0000
            });
        } else if(token === sender.getRegistrationToken()) {
            ctx.answerEmbed({
                description: "Code valide !",
                color: 0xFF00,
            });
            nextStep();
        } else {
            sender.setCounter(sender.getCounter() - 1);
            ctx.answerEmbed({
                description: `Le code fourni ne correspond pas à celui envoyé par message privé sur le forum.
                Il vous reste ${sender.getCounter()} essais.
                `,
                color: 0xFF0000,
            });
        }
        resolve();
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<code>";
    }

}

export class JavaLevelStep extends RegistrationStep {

    public enterStep(sender: UserInfo, ctx: CommandContext): void {
        sender.setCounter(5);
        sender.getJavaQuestionsCat().answeredQuestions = [];

        this.nextQuestion(sender, ctx);
    }
    
    public executeStep(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void, nextStep: () => void): void {
        const answer: number = ctx.requiredArg(new IntArgument());
        
        if(answer - 1 === sender.getJavaQuestionsCat().expectedAnswer) {
            ctx.answerEmbed({
                description: "Bonne réponse !",
                color: 0xFF00
            });
            sender.setCounter(sender.getCounter() - 1);

            if(sender.getCounter() === 0) {
                const guild: Guild = ctx.getDiscordClient().guilds.first();
                const role: Role = guild.roles.find("name", ctx.getConfig().get("roles.javaDancer"));

                guild.member(ctx.getMessage().author).addRole(role).catch(ctx.getLogger().error);

                ctx.answerEmbed({
                    description: "Vous avez le niveau requis en Java. Bravo !",
                    color: 0xFF00
                });
                nextStep();
            } else {
                this.nextQuestion(sender, ctx);
            }

        } else {
            ctx.answerEmbed({
                description: "Vous n'avez pas le niveau nécessaire en Java. Dommage ...",
                color: 0xFF000
            });
            nextStep();
        }
        resolve();
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        return "<réponse>";
    }

    nextQuestion(sender: UserInfo, ctx: CommandContext): void {
        const question: JavaQuestion = this.pickRandomQuestion(ctx.getConfig(), sender);
        this.sendQuestion(sender, ctx, question);
    }

    sendQuestion(sender: UserInfo, ctx: CommandContext, question: JavaQuestion): void {
        const embed: RichEmbed = new RichEmbed();
        embed.setTitle(`Question ${6 - sender.getCounter()} sur 5`);
        embed.setDescription(question.title);
        embed.setColor(0x66FF);

        for(let i = 0;  i < question.choices.length; i++) {
            embed.addField(`Réponse ${i + 1}`, question.choices[i]);
        }

        ctx.answerEmbed(embed);
    }

    pickRandomQuestion(config: Conf<any>, sender: UserInfo): JavaQuestion {
        const cantPick: Array<number> = sender.getJavaQuestionsCat().answeredQuestions;
        const questions: Array<JavaQuestion> = config.get("javaQuestions");
        assert(cantPick.length < questions.length);
        let pickedQuestion: number = -1;

        do {
            pickedQuestion = Math.floor(Math.random() * questions.length);
        } while(cantPick.indexOf(pickedQuestion) !== -1);

        sender.getJavaQuestionsCat().answeredQuestions.push(pickedQuestion);
        sender.getJavaQuestionsCat().expectedAnswer = questions[pickedQuestion].answer;

        return questions[pickedQuestion];
    }

}

interface JavaQuestion {

    title: string;
    choices: Array<string>;
    answer: number;

}