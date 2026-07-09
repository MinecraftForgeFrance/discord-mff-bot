import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies inside vi.mock for Vitest 4
vi.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        sign: vi.fn(),
        verify: vi.fn()
    }
}));

vi.mock('discord.js', () => ({
    Client: class Client {},
    GatewayIntentBits: {
        Guilds: 1,
        GuildMembers: 2,
        GuildMessages: 4,
        DirectMessages: 8,
        MessageContent: 16
    },
    Partials: {
        Channel: 'Channel',
        Message: 'Message'
    },
    EmbedBuilder: class EmbedBuilder {
        color = 0;
        description = '';
        setColor(color: number) {
            this.color = color;
            return this;
        }
        setDescription(desc: string) {
            this.description = desc;
            return this;
        }
    }
}));

// Mock winston for LogOptions.js which is imported by app.js
vi.mock('winston', () => ({
    format: {
        combine: vi.fn((..._args: any[]) => 'combined-format'),
        timestamp: vi.fn((_options: any) => 'timestamp-format'),
        printf: vi.fn((_fn: any) => 'printf-format'),
        colorize: vi.fn((_options: any) => 'colorize-format')
    },
    transports: {
        Console: class Console {},
        DailyRotateFile: class DailyRotateFile {}
    },
    createLogger: vi.fn(() => ({
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        level: ''
    }))
}));

vi.mock('winston-daily-rotate-file', () => ({
    __esModule: true,
    default: class DailyRotateFile {
        constructor(options: any) {
            this.options = options;
        }
        options: any;
    }
}));

vi.mock('../../src/app.js', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        level: ''
    }
}));

vi.mock('../../src/config/config.js', () => ({
    conf: {
        get: vi.fn((key: string) => {
            const config: Record<string, Record<string, string>> = {
                forumLink: {
                    registrationSecret: 'test-secret-key',
                    protocol: 'https',
                    hostname: 'localhost',
                    port: '443'
                },
                application: {
                    guildId: 'test-guild-id'
                },
                roles: {
                    member: 'test-role-id'
                },
                channels: {
                    logs: 'test-logs-channel'
                }
            };
            const [section, field] = key.split('.');
            return config[section]?.[field];
        })
    }
}));

vi.mock('../../src/util.js', () => ({
    sendEmbedToLogChannel: vi.fn(),
    SUCCESS_COLOR: 0x00FF00
}));

// Import after mocks
import jwt from 'jsonwebtoken';
import {
    createRegistrationToken,
    decodeRegistrationToken,
    validateUserRegistration
} from '../../src/util/registration.js';

describe('registration.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createRegistrationToken()', () => {
        it('should create a JWT token with correct payload', () => {
            const mockUser = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarURL: () => 'https://avatar.url'
            };

            const mockToken = 'test-jwt-token';
            jwt.sign.mockReturnValue(mockToken);

            const result = createRegistrationToken(mockUser as any);

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: 'user-123',
                    displayName: 'TestUser',
                    avatarUrl: 'https://avatar.url'
                },
                'test-secret-key',
                { expiresIn: '1h' }
            );
            expect(result).toBe(mockToken);
        });
    });

    describe('decodeRegistrationToken()', () => {
        it('should decode and return valid token payload', () => {
            const mockPayload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            jwt.verify.mockReturnValue(mockPayload);

            const result = decodeRegistrationToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
            expect(result).toEqual(mockPayload);
        });

        it('should throw error for invalid token payload', () => {
            const mockPayload = {
                id: 'user-123',
                displayName: 'TestUser'
            };

            jwt.verify.mockReturnValue(mockPayload);

            expect(() => decodeRegistrationToken('invalid-token')).toThrow('Invalid token');
        });

        it('should throw error when payload is not an object', () => {
            jwt.verify.mockReturnValue(null);

            expect(() => decodeRegistrationToken('null-token')).toThrow('Invalid token');
        });

        it('should throw error when jwt.verify throws', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            expect(() => decodeRegistrationToken('bad-signature-token')).toThrow();
        });

        it('should throw error when id is not a string', () => {
            const mockPayload = {
                id: 123,
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            jwt.verify.mockReturnValue(mockPayload);

            expect(() => decodeRegistrationToken('invalid-id-token')).toThrow('Invalid token');
        });

        it('should throw error when displayName is not a string', () => {
            const mockPayload = {
                id: 'user-123',
                displayName: 123,
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            jwt.verify.mockReturnValue(mockPayload);

            expect(() => decodeRegistrationToken('invalid-displayname-token')).toThrow('Invalid token');
        });

        it('should throw error when avatarUrl is not a string', () => {
            const mockPayload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 123,
                forumUid: 456
            };

            jwt.verify.mockReturnValue(mockPayload);

            expect(() => decodeRegistrationToken('invalid-avatarurl-token')).toThrow('Invalid token');
        });

        it('should throw error when forumUid is missing', () => {
            const mockPayload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url'
            };

            jwt.verify.mockReturnValue(mockPayload);

            expect(() => decodeRegistrationToken('missing-forumUid-token')).toThrow('Invalid token');
        });
    });

    describe('validateUserRegistration()', () => {
        const mockClient = {
            guilds: {
                cache: {
                    first: vi.fn().mockReturnValue(undefined)
                },
                fetch: vi.fn()
            }
        };

        const mockGuild = {
            members: {
                fetch: vi.fn()
            }
        };

        const mockMember = {
            user: {
                username: 'TestUser'
            },
            roles: {
                cache: {
                    has: vi.fn()
                },
                add: vi.fn()
            }
        };

        beforeEach(() => {
            vi.clearAllMocks();
            mockClient.guilds.fetch.mockResolvedValue(mockGuild);
            mockGuild.members.fetch.mockResolvedValue(mockMember);
        });

        it('should add member role when user has no member role', async () => {
            mockMember.roles.cache.has.mockReturnValue(false);
            mockMember.roles.add.mockResolvedValue({});

            const payload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            await validateUserRegistration(payload, mockClient as any);

            expect(mockClient.guilds.fetch).toHaveBeenCalledWith('test-guild-id');
            expect(mockGuild.members.fetch).toHaveBeenCalledWith('user-123');
            expect(mockMember.roles.cache.has).toHaveBeenCalledWith('test-role-id');
            expect(mockMember.roles.add).toHaveBeenCalledWith('test-role-id');
        });

        it('should not add member role when user already has it', async () => {
            mockMember.roles.cache.has.mockReturnValue(true);

            const payload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            await validateUserRegistration(payload, mockClient as any);

            expect(mockMember.roles.cache.has).toHaveBeenCalledWith('test-role-id');
            expect(mockMember.roles.add).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            mockClient.guilds.fetch.mockRejectedValue(new Error('Guild not found'));

            const payload = {
                id: 'user-123',
                displayName: 'TestUser',
                avatarUrl: 'https://avatar.url',
                forumUid: 456
            };

            await expect(validateUserRegistration(payload, mockClient as any))
                .rejects
                .toThrow('Guild not found');
        });
    });
});
