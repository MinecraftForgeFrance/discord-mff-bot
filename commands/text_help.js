module.exports = {
    run: (client, messageUser, message) => {
        message.channel.send({
            embed: {
                color: 0x03BEED,
                title: "Voici les commandes disponibles : ",
                fields: [
                    {
                        name: "support",
                        value: "La syntaxe est soit `!support on`, soit `!support off`."
                    }
                ]
            }
        });
    },
    canRun: () => {
        return true;
    }
};