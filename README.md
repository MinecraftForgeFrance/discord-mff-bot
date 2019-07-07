# discord-mff-bot

This repository contains the source code for Minecraft Forge France's Discord bot.

## Configuration

The configuration file must be located at `dist/config/bot-config.json`.
List of configuration fields :

* `forumLink.protocol`
    * Description : The protocol to use to connect to the forum bridge 
    * Accepted values : `https`, `http`
    * Default value : `https`
* `forumLink.host`
    * Description : The domain the forum bridge is hosted on
    * Accepted values : any string
    * No default value
* `forumLink.port`
    * Description : The port for the forum bridge
    * Accepted values : any integer
    * Default value : `80`
* `forumLink.token`
    * Description : The token to get authentificated on the forum bridge
    * Accepted values : any string
    * No default value
* `channels.logs`
    * Description : The name of log channel
    * Accepted values : any string
    * No default value
* `channels.moddingSupport`
    * Description : The name of modding support channel
    * Accepted values : any string
    * No default value
* `channels.shoutbox`
    * Description : The name of the shoutbox channel
    * Accepted values : any string
    * No default value
* `roles.member`
    * Description : The name of member role
    * Accepted values : any string
    * No default value
* `roles.support`
    * Description : The name of support role
    * Accepted values : any string
    * No default value
* `commandPrefix`
    * Description : The prefix the user needs to add in front of command name
    * Accepted values : any string
    * Default value : `!`
* `application.token`
    * Description : The token required for the bot to connect to your application
    * Accepted values : any string
    * No default value
* `javaQuestions`
    * Description : The pool of questions for java level validation
    * Accepted values : array of java question object
    * No default value
    * Must have at least 5 items
* `javaQuestions`.item
    * Description : A question that can be picked up for java level validation
    * Attributes
        * `title` (string) : the question
        * `choices` (array&lt;string&gt;) : the differents possibilities to answer to the question. Must contains at least 2 items.
        * `answer` (integer) : the good answer

The JSON-Schema can be found [here](src/config/config.ts).

## Contribute

To contribute to the project, clone the repository using `git clone https://github.com/MinecraftForgeFrance/discord-mff-bot`.
Make changes you want. Don't forget to write unit tests in `src/test/` for your changes.
Run the test with `npm test` and start the bot using `npm start`. If tests pass then you can make a pull request.


