import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock winston and winston-daily-rotate-file
// In Vitest 4, all mock definitions must be self-contained within vi.mock

vi.mock('winston', () => {
    class MockTransportConsole {
        constructor(options: any) {
            this.options = options;
        }
        options: any;
    }

    class MockDailyRotateFile {
        constructor(options: any) {
            this.options = options;
        }
        options: any;
    }

    return {
        format: {
            combine: vi.fn((...args: any[]) => {
                // Check if any argument is 'colorize-format' (from format.colorize)
                // If so, return 'colorize-format' as the combined result
                const hasColorize = args.some(arg => arg === 'colorize-format');
                return hasColorize ? 'colorize-format' : 'combined-format';
            }),
            timestamp: vi.fn((_options: any) => 'timestamp-format'),
            printf: vi.fn((_fn: any) => 'printf-format'),
            colorize: vi.fn((_options: any) => 'colorize-format')
        },
        transports: {
            Console: MockTransportConsole,
            DailyRotateFile: MockDailyRotateFile
        }
    };
});

vi.mock('winston-daily-rotate-file', () => {
    class MockDailyRotateFile {
        constructor(options: any) {
            this.options = options;
        }
        options: any;
    }
    return {
        __esModule: true,
        default: MockDailyRotateFile
    };
});

import { options } from '../../src/logging/LogOptions.js';

describe('LogOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('options object', () => {
        it('should have transports array', () => {
            expect(options.transports).toBeDefined();
            expect(Array.isArray(options.transports)).toBe(true);
        });

        it('should have exceptionHandlers array', () => {
            expect(options.exceptionHandlers).toBeDefined();
            expect(Array.isArray(options.exceptionHandlers)).toBe(true);
        });

        it('should have exitOnError set to false', () => {
            expect(options.exitOnError).toBe(false);
        });
    });

    describe('transports', () => {
        it('should have Console transport', async() => {
            const ConsoleTransport = (await import('winston')).transports.Console;
            const consoleTransport = options.transports?.find(
                (t: any) => t instanceof ConsoleTransport
            );
            expect(consoleTransport).toBeDefined();
        });

        it('should have DailyRotateFile transport for success logs', async () => {
            const DailyRotateFile = (await import('winston-daily-rotate-file')).default;
            const dailyTransport = options.transports?.find(
                (t: any) => t instanceof DailyRotateFile && t.options.filename.includes('success_bot_')
            );
            expect(dailyTransport).toBeDefined();
        });

        it('should configure Console transport with colorize format', async () => {
            const ConsoleTransport = (await import('winston')).transports.Console;
            const consoleTransport = options.transports?.find(
                (t: any) => t instanceof ConsoleTransport
            );
            expect(consoleTransport?.options.format).toBe('colorize-format');
        });

        it('should configure DailyRotateFile transport with correct options', async() => {
            const DailyRotateFile = (await import('winston-daily-rotate-file')).default;
            const dailyTransport = options.transports?.find(
                (t: any) => t instanceof DailyRotateFile && t.options.filename.includes('success_bot_')
            );

            expect(dailyTransport?.options.datePattern).toBe('YYYY-MM-DD');
            expect(dailyTransport?.options.dirname).toBe('log/');
            expect(dailyTransport?.options.maxSize).toBe('20m');
            expect(dailyTransport?.options.zippedArchive).toBe(true);
        });
    });

    describe('exceptionHandlers', () => {
        it('should have Console transport for exceptions', async() => {
            const ConsoleTransport = (await import('winston')).transports.Console;
            const consoleTransport = options.exceptionHandlers?.find(
                (t: any) => t instanceof ConsoleTransport
            );
            expect(consoleTransport).toBeDefined();
        });

        it('should have DailyRotateFile transport for error logs', async() => {
            const DailyRotateFile = (await import('winston-daily-rotate-file')).default;
            const dailyTransport = options.exceptionHandlers?.find(
                (t: any) => t instanceof DailyRotateFile && t.options.filename.includes('error_bot_')
            );
            expect(dailyTransport).toBeDefined();
        });

        it('should configure error DailyRotateFile with correct options', async() => {
            const DailyRotateFile = (await import('winston-daily-rotate-file')).default;
            const dailyTransport = options.exceptionHandlers?.find(
                (t: any) => t instanceof DailyRotateFile && t.options.filename.includes('error_bot_')
            );

            expect(dailyTransport?.options.datePattern).toBe('YYYY-MM-DD');
            expect(dailyTransport?.options.dirname).toBe('log/');
            expect(dailyTransport?.options.maxSize).toBe('20m');
            expect(dailyTransport?.options.zippedArchive).toBe(true);
        });
    });
});
