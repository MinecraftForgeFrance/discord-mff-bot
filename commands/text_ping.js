module.exports = {
    run: (client, messageUser, message) => {
        message.channel.send({
            embed: {
                color: 0x03BEED,
                description: ":ping_pong: Pong: `" + `${Date.now() - message.createdTimestamp} ms` + "`"
            }
        }).catch(console.error());
    },
    canRun: () => {
        return true;
    }
};