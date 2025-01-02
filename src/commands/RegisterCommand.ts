import {Command} from "./Command.js";
import {ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client} from "discord.js";
import {logger} from "../app.js";

export const RegisterCommand: Command = {
    name: "register",
    description: "Permet de s'enregistrer afin d'avoir accès au Discord",
    type: ApplicationCommandType.ChatInput,
    dmPermission: true,
    options: [
        {
            name: "pseudo",
            description: "Votre pseudo sur le forum",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pseudo",
                    description: "Votre pseudo sur le forum",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "code",
            description: "Code reçu sur le forum",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    run: async (_: Client, interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getSubcommand(true) === "pseudo") {
            logger.info(interaction.options.getString("pseudo"));
            /*requestForum("register", "POST", {
                username: pseudo,
                token: conf.get("forumLink.token")
            }).catch().then(body => {
                if (body.error === "User not found") {
                    interaction.reply({
                        embeds: [{
                            color: ERROR_COLOR,
                            description: "Le pseudo que vous avez indiqué n'existe pas, essayez encore."
                        }]
                    });
                } else {
                    const token: string = body.result;
                    const userId: number = body.userId;
                    sender.setRegistrationToken(token);
                    sender.setForumId(userId);
                    interaction.reply({
                        embeds: [{
                            description: "Vous avez reçu un message privé sur le forum contenant un code d'activation. Veuillez le récupérer et passer à la suite.",
                            color: 0xFF00,
                        }]
                    });
                }
            });*/
            // if(interaction.options.getSubcommand(true) === "code") {}
        }
    }
};
