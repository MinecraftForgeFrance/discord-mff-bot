import { Command } from "./Command";
import { UserInfo } from "../user/UserInfo";
import { CommandContext } from "./CommandContext";
import { QuerySession } from "../user/UsersManager";
import { PermissionBuilder } from "./permission/PermissionBuilder";
import { addMemberRole, INFO_COLOR, memberJoin } from "../util/util";
import { FetchPseudoStep, RegistrationStep, ValidateTokenStep } from "../registriation/RegistrationStep";

export class RegisterCommand extends Command {

    private steps: Array<RegistrationStep> = [];

    constructor() {
        super((sender, ctx) => {
            return PermissionBuilder.new().channelTypeIs('dm').build()(sender, ctx) && sender.getRegistrationStep() < this.steps.length;
        });
        this.steps.push(
            new FetchPseudoStep(),
            new ValidateTokenStep(),
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
        if (step === this.steps.length) {
            if (step === 0) {
                return "...";
            }
            return this.steps[0].getUsage(sender, ctx);
        }
        return this.steps[step].getUsage(sender, ctx);
    }

    public perform(sender: UserInfo, ctx: CommandContext, querySession: QuerySession, resolve: () => void, reject: () => void): void {
        const nextStepId = sender.getRegistrationStep() + 1;
        // Triggers next step
        const nextStep: () => void = () => {
            sender.setRegistrationStep(nextStepId);
            sendCurrentStep();

            if (sender.getRegistrationStep() === this.steps.length) {
                addMemberRole(ctx.getDiscordClient(), ctx.getConfig(), ctx.getMessage().author)
                    .then((member) => ctx.getLogger().info(`${member.user.username}@${member.id} became member after registration`))
                    .catch((reason) => ctx.getLogger().error(`Unable to promote ${ctx.getMessage().author.username}@${ctx.getMessage().author.id} to member. Cause : ${reason}`));
                memberJoin(ctx.getDiscordClient(), ctx.getConfig(), ctx.getMessage().author, ctx.getLogger());
            } else {
                this.steps[nextStepId].enterStep(sender, ctx);
            }
        };

        // Prints current step
        const sendCurrentStep: () => void = () => {
            if (sender.getRegistrationStep() < this.steps.length) {
                const nextStepUsage: string = this.steps[sender.getRegistrationStep()].getUsage(sender, ctx);
                ctx.answerEmbed({
                    description: `Vous êtes à l'étape ${sender.getRegistrationStep() + 1}/${this.steps.length} de votre enregistrement.
                    Vous devez taper : \`${ctx.getConfig().get("commandPrefix")}${this.getName()} ${nextStepUsage}\``,
                    color: INFO_COLOR
                });
            } else {
                ctx.answerEmbed({
                    description: "Vous avez terminé votre enregistrement.",
                    color: INFO_COLOR
                });
            }
        };

        // If no arguments were provided, we print current state
        if (ctx.getReader().getRemainingCharacters() === 0) {
            sendCurrentStep();
            resolve();
        } else {
            const step = this.steps[sender.getRegistrationStep()];
            step.executeStep(sender, ctx, resolve, reject, nextStep);
        }
    }
}
