import { describe, it, expect } from 'vitest';
import { UserInfo } from '../../src/users/UserInfo.js';

describe('UserInfo', () => {
    describe('constructor', () => {
        it('should create UserInfo with discordId and forumId from JSON', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-123',
                forumId: 456
            });

            const userInfo = new UserInfo(jsonStr);

            expect(userInfo.getDiscordId()).toBe('user-123');
            expect(userInfo.getForumId()).toBe(456);
        });

        it('should create UserInfo with discordId and null forumId', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-456'
            });

            const userInfo = new UserInfo(jsonStr);

            expect(userInfo.getDiscordId()).toBe('user-456');
            expect(userInfo.getForumId()).toBeNull();
        });

        it('should throw error when discordId is missing', () => {
            const jsonStr = JSON.stringify({
                forumId: 456
            });

            expect(() => new UserInfo(jsonStr)).toThrow("Field 'discordId' must be specified.");
        });

        it('should handle empty forumId', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-789',
                forumId: null
            });

            const userInfo = new UserInfo(jsonStr);

            expect(userInfo.getDiscordId()).toBe('user-789');
            expect(userInfo.getForumId()).toBeNull();
        });

        it('should handle forumId as 0 (note: 0 is treated as null due to falsy check in code)', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-000',
                forumId: 0
            });

            const userInfo = new UserInfo(jsonStr);

            expect(userInfo.getDiscordId()).toBe('user-000');
            // Note: The UserInfo constructor uses `if (parsed.forumId)` which treats 0 as falsy
            // So forumId=0 will be set to null. This is the current behavior of the code.
            expect(userInfo.getForumId()).toBeNull();
        });
    });

    describe('getDiscordId()', () => {
        it('should return the discordId', () => {
            const jsonStr = JSON.stringify({
                discordId: 'test-id'
            });

            const userInfo = new UserInfo(jsonStr);
            expect(userInfo.getDiscordId()).toBe('test-id');
        });
    });

    describe('getForumId()', () => {
        it('should return the forumId when set', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-1',
                forumId: 123
            });

            const userInfo = new UserInfo(jsonStr);
            expect(userInfo.getForumId()).toBe(123);
        });

        it('should return null when forumId is not set', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-2'
            });

            const userInfo = new UserInfo(jsonStr);
            expect(userInfo.getForumId()).toBeNull();
        });
    });

    describe('setForumId()', () => {
        it('should set forumId to a number', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-3'
            });

            const userInfo = new UserInfo(jsonStr);
            expect(userInfo.getForumId()).toBeNull();

            userInfo.setForumId(999);
            expect(userInfo.getForumId()).toBe(999);
        });

        it('should allow updating forumId from one value to another', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-4',
                forumId: 100
            });

            const userInfo = new UserInfo(jsonStr);
            expect(userInfo.getForumId()).toBe(100);

            userInfo.setForumId(200);
            expect(userInfo.getForumId()).toBe(200);
        });

        it('should allow setting forumId to 0', () => {
            const jsonStr = JSON.stringify({
                discordId: 'user-5'
            });

            const userInfo = new UserInfo(jsonStr);
            userInfo.setForumId(0);
            expect(userInfo.getForumId()).toBe(0);
        });
    });

    describe('immutability', () => {
        it('should allow direct modification of discordId at runtime (note: TypeScript readonly is compile-time only)', () => {
            const jsonStr = JSON.stringify({
                discordId: 'original-id'
            });

            const userInfo = new UserInfo(jsonStr);
            
            // Note: TypeScript's readonly modifier is only enforced at compile time
            // At runtime, the property can still be modified
            // @ts-expect-error - we're testing runtime behavior
            userInfo.discordId = 'modified-id';

            // In JavaScript runtime, the property IS modified
            expect(userInfo.getDiscordId()).toBe('modified-id');
        });
    });
});
