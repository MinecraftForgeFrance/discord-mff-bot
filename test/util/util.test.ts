import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Use vi.hoisted() to create mocks that are accessible before vi.mock() calls
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
}));

const mockConf = vi.hoisted(() => ({
    get: vi.fn((key: string) => {
        const config: Record<string, Record<string, string | number>> = {
            forumLink: {
                protocol: 'https',
                hostname: 'localhost',
                port: 443
            },
            channels: {
                logs: 'logs'
            }
        };
        const [section, field] = key.split('.');
        return config[section]?.[field];
    })
}));

// Create a mock for axios before importing the module
const mockAxios = vi.hoisted(() => vi.fn() as Mock);

vi.mock('axios', () => ({
    default: mockAxios
}));

vi.mock('../../src/app.js', () => ({
    logger: mockLogger
}));

vi.mock('../../src/config/config.js', () => ({
    conf: mockConf
}));

// Import after mocks
import {
    isOk,
    isError,
    FORUM_URL,
    SUCCESS_COLOR,
    ERROR_COLOR,
    INFO_COLOR,
    AVATAR_URL,
    requestForum,
    fetchDynamicChoices,
    sendEmbedToLogChannel
} from '../../src/util/util.js';

describe('util.ts - Type Guards', () => {
    describe('isOk()', () => {
        it('should return true for ResponseData with data property', () => {
            const response = { data: { test: ['item1', 'item2'] } };
            expect(isOk(response)).toBe(true);
        });

        it('should return false for ErrorResponse', () => {
            const response = { message: 'Error occurred' };
            expect(isOk(response)).toBe(false);
        });

        it('should return false for RegisterResponse', () => {
            const response = { result: 'success', userId: 123 };
            expect(isOk(response)).toBe(false);
        });

        it('should return false when data is not an object', () => {
            const response = { data: 'string' };
            expect(isOk(response)).toBe(false);
        });

        it('should return false for empty object', () => {
            const response = {};
            expect(isOk(response)).toBe(false);
        });
    });

    describe('isError()', () => {
        it('should return true for ErrorResponse with message property', () => {
            const response = { message: 'Error occurred' };
            expect(isError(response)).toBe(true);
        });

        it('should return false for ResponseData', () => {
            const response = { data: { test: [] } };
            expect(isError(response)).toBe(false);
        });

        it('should return false for RegisterResponse', () => {
            const response = { result: 'success', userId: 123 };
            expect(isError(response)).toBe(false);
        });

        it('should return false for empty object', () => {
            const response = {};
            expect(isError(response)).toBe(false);
        });
    });
});

describe('util.ts - Constants', () => {
    describe('FORUM_URL', () => {
        it('should construct URL from config values', () => {
            expect(FORUM_URL).toBe('https://localhost:443');
        });
    });

    describe('Color constants', () => {
        it('should have correct color values', () => {
            expect(SUCCESS_COLOR).toBe(0x00FF00);
            expect(ERROR_COLOR).toBe(0xFF0000);
            expect(INFO_COLOR).toBe(0x0066FF);
        });
    });

    describe('AVATAR_URL', () => {
        it('should have the correct avatar URL', () => {
            expect(AVATAR_URL).toBe('https://cdn.discordapp.com/attachments/270667098143981589/347773487093383189/avatar_128x128_transparent.png');
        });
    });
});

describe('util.ts - Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requestForum()', () => {
        it('should return ErrorResponse on axios error', async () => {
            mockAxios.mockRejectedValue(new Error('Network error'));

            const result = await requestForum('/test', 'GET');
            expect(result).toEqual({ message: 'An error occurred while fetching data.' });
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should return data on successful axios call', async () => {
            const mockData = { data: { test: 'value' } };
            mockAxios.mockResolvedValue({ data: mockData });

            const result = await requestForum('/test', 'GET');
            expect(result).toEqual(mockData);
        });
    });

    describe('fetchDynamicChoices()', () => {
        beforeEach(() => {
            global.fetch = vi.fn();
        });

        it('should return ErrorResponse on fetch error', async () => {
            (global.fetch as Mock).mockRejectedValue(new Error('Fetch error'));

            const result = await fetchDynamicChoices();
            expect(result).toEqual({ message: 'An error occurred while fetching data.' });
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should return ErrorResponse on non-ok response', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: false,
                status: 500
            });

            const result = await fetchDynamicChoices();
            expect(result).toEqual({ message: 'Unable to fetch dynamic choices.' });
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should filter and map tags correctly', async () => {
            const mockTags = [
                { value: '1.20.x', valueEscaped: '1_20_x' },
                { value: '1.19.x', valueEscaped: '1_19_x' },
                { value: 'invalid', valueEscaped: 'invalid' },
                { value: '1.18.0', valueEscaped: '1_18_0' }
            ];

            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ tags: mockTags })
            });

            const result = await fetchDynamicChoices();
            
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ name: '1.20.x', value: '1_20_x' });
        });

        it('should limit to 25 results', async () => {
            const mockTags = Array.from({ length: 30 }, (_, i) => ({
                value: `${i}.0.x`,
                valueEscaped: `${i}_0_x`
            }));

            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ tags: mockTags })
            });

            const result = await fetchDynamicChoices();
            expect(result).toHaveLength(25);
        });
    });

    describe('sendEmbedToLogChannel()', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should send embed to log channel if it exists and is text-based', () => {
            const mockSend = vi.fn().mockResolvedValue({});
            const mockChannel = {
                name: 'logs',
                isTextBased: () => true,
                send: mockSend
            };

            const mockGuild = {
                channels: {
                    cache: {
                        find: vi.fn().mockReturnValue(mockChannel)
                    }
                }
            };

            const mockClient = {
                guilds: {
                    cache: {
                        first: vi.fn().mockReturnValue(mockGuild)
                    }
                }
            };

            const mockEmbed = { data: 'test' };
            
            sendEmbedToLogChannel(mockClient as any, mockEmbed as any);
            
            expect(mockGuild.channels.cache.find).toHaveBeenCalledWith(expect.any(Function));
            expect(mockSend).toHaveBeenCalledWith({ embeds: [mockEmbed] });
        });

        it('should not send if channel is not text-based', () => {
            const mockSend = vi.fn();
            const mockChannel = {
                name: 'logs',
                isTextBased: () => false,
                send: mockSend
            };

            const mockGuild = {
                channels: {
                    cache: {
                        find: vi.fn().mockReturnValue(mockChannel)
                    }
                }
            };

            const mockClient = {
                guilds: {
                    cache: {
                        first: vi.fn().mockReturnValue(mockGuild)
                    }
                }
            };

            const mockEmbed = { data: 'test' };
            
            sendEmbedToLogChannel(mockClient as any, mockEmbed as any);
            
            expect(mockSend).not.toHaveBeenCalled();
        });

        it('should not send if no guild found', () => {
            const mockClient = {
                guilds: {
                    cache: {
                        first: vi.fn().mockReturnValue(null)
                    }
                }
            };

            const mockEmbed = { data: 'test' };
            
            sendEmbedToLogChannel(mockClient as any, mockEmbed as any);
            
            expect(() => sendEmbedToLogChannel(mockClient as any, mockEmbed as any)).not.toThrow();
        });
    });
});
