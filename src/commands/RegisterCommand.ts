import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { RegistrationStep, FetchPseudoStep, ValidateTokenStep, JavaLevelStep } from "../registriation/RegistrationStep";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { CommandContext } from "./CommandContext";
import { Guild, Role, GuildChannel, TextChannel } from "discord.js";

export class RegisterCommand extends Command {

    private steps: Array<RegistrationStep> = [];
    
    constructor() {
        super((sender, ctx) => {
            return PermissionBuilder.new().channelTypeIs('dm').build()(sender, ctx) && sender.getRegistrationStep() < this.steps.length;
        });
        this.steps.push(
            new FetchPseudoStep(),
            new ValidateTokenStep(),
            new JavaLevelStep(),
        );
    }
    
    public getName(): string {
        return "register";
    }   
    
    public getDescription(): string {
        return "Permet de s'enregistrer afin d'avoir accès au Discord";
    }
    
    public getUsage(sender: UserInfo, ctx: CommandContext): string {
        const step: number = sender.getRegistrationStep();
        if(step === this.steps.length) {
            if(step === 0) {
                return "...";
            }
            return this.steps[0].getUsage(sender, ctx);
        }
        return this.steps[step].getUsage(sender, ctx);
    }

    public perform(sender: UserInfo, ctx: CommandContext, resolve: () => void, reject: () => void): void {
        const nextStepId = sender.getRegistrationStep() + 1;
        // Triggers next step
        const nextStep: () => void = () => {
            sender.setRegistrationStep(nextStepId);
            sendCurrentStep();

            if(sender.getRegistrationStep() === this.steps.length) {
                const guild: Guild = ctx.getDiscordClient().guilds.first();
                const role: Role = guild.roles.find("name", ctx.getConfig().get("roles.member"));
                guild.member(ctx.getMessage().author).addRole(role, "Enregistrement terminé")
                        .then((member) => ctx.getLogger().info(`${member.user.username}@${member.id} became member after registration`))
                        .catch((reason) => ctx.getLogger().error(`Unable to promote ${ctx.getMessage().author.username}@${ctx.getMessage().author.id} to member. Cause : ${reason}`));
                const logsChannel: GuildChannel = guild.channels.find("name", ctx.getConfig().get("channels.logs"));
                (logsChannel as TextChannel).send({
                    embed: {
                        description: `${ctx.getMessage().author.username} a rejoint le serveur`,
                        color: 0xFF00
                    }
                })
                .then((message) => {})
                .catch((err) => ctx.getLogger().error(`Can't send message to logs channel : ${err}`));
            } else {
                this.steps[nextStepId].enterStep(sender, ctx);
            }
        };

        // Prints current step
        const sendCurrentStep: () => void = () => {
            if(sender.getRegistrationStep() < this.steps.length) {
                const nextStepUsage: string = this.steps[sender.getRegistrationStep()].getUsage(sender, ctx);
                ctx.answerEmbed({
                    description: `Vous êtes à l'étape ${sender.getRegistrationStep() + 1}/${this.steps.length} de votre enregistrement.
                    Vous devez taper : \`${ctx.getConfig().get("commandPrefix")}${this.getName()} ${nextStepUsage}\``,
                    color: 0x66FF
                });
            } else {
                ctx.answerEmbed({
                    description: "Vous avez terminé votre enregistrement.",
                    color: 0x66FF
                });
            }
        }

        // If no arguments were provided, we print current state
        if(ctx.getReader().getRemainingCharacters() === 0) {
            sendCurrentStep();
            resolve();
        } else {
            const step = this.steps[sender.getRegistrationStep()];
            step.executeStep(sender, ctx, resolve, reject, nextStep);
        }
    }

}