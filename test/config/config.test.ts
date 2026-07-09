import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track constructor calls
const confConstructorCalls: any[] = [];

// In Vitest 4, use vi.hoisted to ensure mock is available before any imports
const MockConfClass = vi.hoisted(() => {
    return class Conf {
        constructor(options: any) {
            confConstructorCalls.push(options);
        }
        get = vi.fn();
        set = vi.fn();
        delete = vi.fn();
        clear = vi.fn();
        on = vi.fn();
        off = vi.fn();
    };
});

vi.mock('conf', () => ({
    __esModule: true,
    default: MockConfClass
}));

describe('config.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        confConstructorCalls.length = 0; // Clear the array
        // Reset the module cache so that config.ts can be re-imported with fresh mocks
        vi.resetModules();
    });

    // Helper to import config module after mocks are active
    const importConfig = async () => {
        return await import('../../src/config/config.js');
    };

    describe('conf instance', () => {
        it('should be an instance of Conf', async () => {
            await importConfig();
            expect(confConstructorCalls.length).toBe(1);
            expect(confConstructorCalls[0]).toEqual({
                configName: 'bot-config',
                cwd: './config',
                schema: expect.any(Object)
            });
        });

        it('should have correct configName', async () => {
            await importConfig();
            expect(confConstructorCalls[0].configName).toBe('bot-config');
        });

        it('should have correct cwd', async () => {
            await importConfig();
            expect(confConstructorCalls[0].cwd).toBe('./config');
        });
    });

    describe('schema validation', () => {
        it('should have application section with required fields', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.application).toBeDefined();
            expect(schema.application.type).toBe('object');
            expect(schema.application.required).toContain('token');
            expect(schema.application.required).toContain('clientId');
            expect(schema.application.required).toContain('guildId');
        });

        it('should have forumLink section with required fields', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.forumLink).toBeDefined();
            expect(schema.forumLink.type).toBe('object');
            expect(schema.forumLink.required).toContain('hostname');
            expect(schema.forumLink.required).toContain('token');
            expect(schema.forumLink.required).toContain('registrationSecret');
        });

        it('should have channels section with required fields', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.channels).toBeDefined();
            expect(schema.channels.type).toBe('object');
            expect(schema.channels.required).toContain('logs');
            expect(schema.channels.required).toContain('moddingSupport');
            expect(schema.channels.required).toContain('shoutbox');
        });

        it('should have roles section with required fields', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.roles).toBeDefined();
            expect(schema.roles.type).toBe('object');
            expect(schema.roles.required).toContain('member');
            expect(schema.roles.required).toContain('support');
        });

        it('should have default values for forumLink protocol and port', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.forumLink.properties.protocol.default).toBe('https');
            expect(schema.forumLink.properties.port.default).toBe(443);
        });

        it('should validate protocol pattern', async () => {
            await importConfig();
            const schema = confConstructorCalls[0].schema;

            expect(schema.forumLink.properties.protocol.pattern).toBe('https?');
        });
    });
});
