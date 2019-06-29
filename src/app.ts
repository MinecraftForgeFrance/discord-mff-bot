import { Client } from 'discord.js';
import { CommandsDispatcher, CommandContext } from './commands/Command';
import { UsersManager, DiscAccess } from './user/UsersManager';
import { StringReader } from './parser/StringReader';

const client = new Client();
const usersManager = new UsersManager(new DiscAccess());
const commandsDispatcher = new CommandsDispatcher(usersManager);

client.on('message', function(message) {
    if(message.author.bot)
        return;
    
    if(message.content.indexOf('!') === 0)
    {
        const ctx: CommandContext = new CommandContext(new StringReader(message.content.substring(1)), client, message);
        commandsDispatcher.dispatchCommand(message.author.id, ctx);
    }

});