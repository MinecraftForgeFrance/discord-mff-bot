import { JSONSchema } from "json-schema-typed";

export const schema: {[key: string]: JSONSchema} = {
    forumLink: {
        type: "object",
        properties: {
            protocol: {
                type: "string",
                pattern: "https?",
                default: "https"
            },
            port: {
                type: "integer",
                default: 80
            },
            hostname: {
                type: "string"
            },
            token : {
                type: "string"
            }
        },
        required: ["hostname", "token"],
        default: {}
    },
    channels: {
        type: "object",
        properties: {
            logs: {
                type: "string"
            },
            moddingSupport: {
                type: "string"
            },
            shoutbox: {
                type: "string"
            }
        },
        required: ["logs", "moddingSupport", "shoutbox"],
        default: {}
    },
    roles: {
        type: "object",
        properties: {
            member: {
                type: "string"
            },
            support: {
                type: "string"
            }
        },
        required: ["member", "support"],
        default: {}
    },
    commandPrefix: {
        type: "string",
        default: "!"
    },
    application: {
        type: "object",
        properties: {
            token: {
                type: "string"
            }
        },
        required: ['token'],
        default: {}
    }
};