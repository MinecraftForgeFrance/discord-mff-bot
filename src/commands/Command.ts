import {ChatInputApplicationCommandData, ChatInputCommandInteraction, Client} from "discord.js";
import {PingCommand} from "./PingCommand.js";
import {TutorialCommand} from "./TutorialCommand.js";
import {RegisterCommand} from "./RegisterCommand.js";

export interface Command extends ChatInputApplicationCommandData {
    allowedChannels?: string[];
    run: (client: Client, interaction: ChatInputCommandInteraction) => void;
}

export const GlobalCommands: Command[] = [
    PingCommand,
    TutorialCommand,
    RegisterCommand
];
export const GuildCommands: Command[] = [];
