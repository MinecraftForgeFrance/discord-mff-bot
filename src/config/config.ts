import {JSONSchema} from "json-schema-typed";

export const schema: { [key: string]: JSONSchema } = {
    application: {
        type: "object",
        properties: {
            token: {type: "string"},
            clientId: {type: "string"},
            guildId: {type: "string"}
        },
        required: ["token", "clientId", "guildId"],
        default: {}
    },
    forumLink: {
        type: "object",
        properties: {
            protocol: {
                type: "string",
                pattern: "https?",
                default: "https"
            },
            port: {type: "integer", default: 443},
            hostname: {type: "string"},
            token: {type: "string"}
        },
        required: ["hostname", "token"],
        default: {}
    }
};
