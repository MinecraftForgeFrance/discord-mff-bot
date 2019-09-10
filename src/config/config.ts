import {JSONSchema} from "json-schema-typed";

export const schema: { [key: string]: JSONSchema } = {
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
            token: {
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
            shoutbox: {
                type: "string"
            }
        },
        required: ["logs", "shoutbox"],
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
            },
            javaDancer: {
                type: "string"
            }
        },
        required: ["member", "support", "javaDancer"],
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
    },
    javaQuestions: {
        type: "array",
        items: {
            type: "object",
            properties: {
                title: {
                    type: "string"
                },
                choices: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    default: [],
                    uniqueItems: true,
                    minItems: 2
                },
                answer: {
                    type: "integer"
                }
            },
            required: ["title", "choices", "answer"]
        },
        default: [],
        uniqueItems: true,
        minItems: 5
    },
    ban: {
        type: "object",
        properties: {
            unbanInterval: {
                type: "integer",
                minimum: 1,
                default: 5_000 // = 5 seconds
            }
        },
        required: ["unbanInterval"],
        default: {}
    }
};
