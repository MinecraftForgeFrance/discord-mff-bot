import {ChatInputApplicationCommandData, ChatInputCommandInteraction, Client} from "discord.js";
import {PingCommand} from "./PingCommand.js";
import {TutorialCommand} from "./TutorialCommand.js";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: ChatInputCommandInteraction) => void;
}

export const GlobalCommands: Command[] = [
    PingCommand,
    TutorialCommand
];
export const GuildCommands: Command[] = [];
