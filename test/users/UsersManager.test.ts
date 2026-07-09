import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vol } from 'memfs';

// Utilise le mock automatique de __mocks__/fs.ts
vi.mock('fs');

// Import après le mock
import { UsersManager, QuerySession, DiscAccess } from '../../src/users/UsersManager.js';
import { UserInfo } from '../../src/users/UserInfo.js';

describe('UsersManager', () => {
    let usersManager: UsersManager;
    let discAccess: DiscAccess;

    beforeEach(() => {
        // Réinitialise le filesystem en mémoire avant chaque test
        vol.reset();
        
        // Crée la structure de base
        vol.mkdirSync('data', { recursive: true });
        vol.mkdirSync('data/users', { recursive: true });
        
        discAccess = new DiscAccess();
        usersManager = new UsersManager(discAccess);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create data and data/users directories if they do not exist', () => {
            // Réinitialise le vol pour ce test
            vol.reset();
            
            new UsersManager(discAccess);

            // Vérifie que les dossiers ont été créés
            expect(vol.existsSync('data')).toBe(true);
            expect(vol.existsSync('data/users')).toBe(true);
        });

        it('should not create directories if they already exist', () => {
            // Les dossiers existent déjà via le setup de beforeEach
            new UsersManager(discAccess);

            // Vérifie que les dossiers existent toujours
            expect(vol.existsSync('data')).toBe(true);
            expect(vol.existsSync('data/users')).toBe(true);
        });
    });

    describe('getUser()', () => {
        it('should return cached user if available', () => {
            const cachedUser = new UserInfo(JSON.stringify({ discordId: 'cached-user' }));
            // @ts-expect-error - accessing private property for test
            usersManager.usersCache = { 'cached-user': cachedUser };

            const querySession = usersManager.beginSession();
            const result = usersManager.getUser(querySession, 'cached-user');

            expect(result).toBe(cachedUser);
        });

        it('should load user from file if not in cache', () => {
            // Crée un fichier utilisateur
            vol.writeFileSync(
                'data/users/file-user.json',
                JSON.stringify({ discordId: 'file-user' })
            );

            const querySession = usersManager.beginSession();
            const result = usersManager.getUser(querySession, 'file-user');

            expect(result.getDiscordId()).toBe('file-user');
        });

        it('should create new user if not in cache or file', () => {
            const querySession = usersManager.beginSession();
            const result = usersManager.getUser(querySession, 'new-user');

            expect(result.getDiscordId()).toBe('new-user');
            expect(result.getForumId()).toBeNull();
        });

        it('should cache the user after retrieval', () => {
            const querySession = usersManager.beginSession();
            usersManager.getUser(querySession, 'new-user');

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersCache['new-user']).toBeDefined();
        });

        it('should set user as owned by query session', () => {
            const querySession = usersManager.beginSession();
            usersManager.getUser(querySession, 'new-user');

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['new-user']).toContain(querySession);
        });
    });

    describe('getFromCache()', () => {
        it('should return user from cache if exists', () => {
            const cachedUser = new UserInfo(JSON.stringify({ discordId: 'cached-user' }));
            // @ts-expect-error - accessing private property for test
            usersManager.usersCache = { 'cached-user': cachedUser };

            const result = usersManager.getFromCache('cached-user');
            expect(result).toBe(cachedUser);
        });

        it('should return null if user not in cache', () => {
            const result = usersManager.getFromCache('non-existent-user');
            expect(result).toBeNull();
        });
    });

    describe('getFromFile()', () => {
        it('should return UserInfo from file if it exists', () => {
            vol.writeFileSync(
                'data/users/file-user.json',
                JSON.stringify({ discordId: 'file-user', forumId: 123 })
            );

            const result = usersManager.getFromFile('file-user');
            expect(result).toBeInstanceOf(UserInfo);
            expect(result?.getDiscordId()).toBe('file-user');
            expect(result?.getForumId()).toBe(123);
        });

        it('should return null if file does not exist', () => {
            const result = usersManager.getFromFile('non-existent-user');
            expect(result).toBeNull();
        });

        it('should return null if JSON parsing fails', () => {
            vol.writeFileSync('data/users/invalid-json-user.json', 'invalid json');

            const result = usersManager.getFromFile('invalid-json-user');
            expect(result).toBeNull();
        });

        it('should return null if UserInfo construction fails', () => {
            vol.writeFileSync(
                'data/users/invalid-userinfo-user.json',
                JSON.stringify({ forumId: 123 }) // Missing discordId
            );

            const result = usersManager.getFromFile('invalid-userinfo-user');
            expect(result).toBeNull();
        });
    });

    describe('cacheUser()', () => {
        it('should add user to cache if not already cached', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-to-cache' }));
            
            usersManager.cacheUser(user);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersCache['user-to-cache']).toBe(user);
        });

        it('should not overwrite existing cached user', () => {
            const user1 = new UserInfo(JSON.stringify({ discordId: 'user-to-cache' }));
            const user2 = new UserInfo(JSON.stringify({ discordId: 'user-to-cache', forumId: 123 }));
            
            // @ts-expect-error - accessing private property for test
            usersManager.usersCache['user-to-cache'] = user1;
            usersManager.cacheUser(user2);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersCache['user-to-cache']).toBe(user1);
        });
    });

    describe('setOwned()', () => {
        it('should add query session to user holders', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-1' }));
            const querySession = usersManager.beginSession();

            usersManager.setOwned(user, querySession);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-1']).toContain(querySession);
        });

        it('should create array for user if not exists', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-2' }));
            const querySession = usersManager.beginSession();

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-2']).toBeUndefined();
            
            usersManager.setOwned(user, querySession);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-2']).toBeDefined();
            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-2']).toHaveLength(1);
        });

        it('should not add duplicate query session', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-3' }));
            const querySession = usersManager.beginSession();

            usersManager.setOwned(user, querySession);
            usersManager.setOwned(user, querySession);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-3']).toHaveLength(1);
        });
    });

    describe('freeFromOwner()', () => {
        it('should remove query session from all user holders', () => {
            const user1 = new UserInfo(JSON.stringify({ discordId: 'user-1' }));
            const user2 = new UserInfo(JSON.stringify({ discordId: 'user-2' }));
            const querySession = usersManager.beginSession();

            usersManager.setOwned(user1, querySession);
            usersManager.setOwned(user2, querySession);

            usersManager.freeFromOwner(querySession);

            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-1']).not.toContain(querySession);
            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-2']).not.toContain(querySession);
        });
    });

    describe('uncacheFreeData()', () => {
        it('should write and remove cached data when no owners', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-1' }));
            const querySession = usersManager.beginSession();

            usersManager.cacheUser(user);
            usersManager.setOwned(user, querySession);

            // Free the user from the session
            usersManager.freeFromOwner(querySession);

            // @ts-expect-error - accessing private property for test
            usersManager.usersHolders['user-1'] = []; // Manually clear entries

            usersManager.uncacheFreeData();

            // Vérifie que le fichier a été écrit
            expect(vol.existsSync('data/users/user-1.json')).toBe(true);
            const fileContent = vol.readFileSync('data/users/user-1.json', 'utf8');
            expect(fileContent).toBeTypeOf('string');
            const parsedContent = JSON.parse(fileContent as string);
            expect(parsedContent.discordId).toBe('user-1');
            
            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersCache['user-1']).toBeUndefined();
            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersHolders['user-1']).toBeUndefined();
        });

        it('should not uncache data that still has owners', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-2' }));
            const querySession = usersManager.beginSession();

            usersManager.cacheUser(user);
            usersManager.setOwned(user, querySession);

            usersManager.uncacheFreeData();

            // User still has an owner, so should not be uncached
            // Vérifie que le fichier n'a pas été écrit
            expect(vol.existsSync('data/users/user-2.json')).toBe(false);
            // @ts-expect-error - accessing private property for test
            expect(usersManager.usersCache['user-2']).toBeDefined();
        });
    });

    describe('beginSession()', () => {
        it('should return a new QuerySession', () => {
            const querySession = usersManager.beginSession();
            expect(querySession).toBeInstanceOf(QuerySession);
        });
    });

    describe('endSession()', () => {
        it('should free all users from the session and uncache free data', () => {
            const user = new UserInfo(JSON.stringify({ discordId: 'user-1' }));
            const querySession = usersManager.beginSession();

            usersManager.cacheUser(user);
            usersManager.setOwned(user, querySession);

            usersManager.endSession(querySession);

            // Vérifie que le fichier a été écrit
            expect(vol.existsSync('data/users/user-1.json')).toBe(true);
        });
    });
});

describe('QuerySession', () => {
    let usersManager: UsersManager;
    let discAccess: DiscAccess;

    beforeEach(() => {
        vol.reset();
        vol.mkdirSync('data', { recursive: true });
        vol.mkdirSync('data/users', { recursive: true });
        discAccess = new DiscAccess();
        usersManager = new UsersManager(discAccess);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getUser()', () => {
        it('should delegate to UsersManager.getUser()', () => {
            const querySession = usersManager.beginSession();
            
            // Mock the UsersManager.getUser method
            const mockUser = new UserInfo(JSON.stringify({ discordId: 'test-user' }));
            const getUserSpy = vi.spyOn(usersManager, 'getUser').mockReturnValue(mockUser);

            const result = querySession.getUser('test-user');

            expect(result).toBe(mockUser);
            expect(getUserSpy).toHaveBeenCalledWith(querySession, 'test-user');
        });
    });
});

describe('DiscAccess', () => {
    let discAccess: DiscAccess;

    beforeEach(() => {
        vol.reset();
        // Crée la structure de base
        vol.mkdirSync('/test', { recursive: true });
        discAccess = new DiscAccess();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('exists()', () => {
        it('should call fs.existsSync', () => {
            // Crée un fichier pour le test
            vol.writeFileSync('/test/test-path', 'content');

            const result = discAccess.exists('/test/test-path');

            expect(result).toBe(true);
        });

        it('should return false for non-existent file', () => {
            const result = discAccess.exists('/test/non-existent-path');
            expect(result).toBe(false);
        });
    });

    describe('read()', () => {
        it('should call fs.readFileSync with utf8 encoding', () => {
            vol.writeFileSync('/test/test-path', 'file content');

            const result = discAccess.read('/test/test-path');

            expect(result).toBe('file content');
        });

        it('should return empty string for empty file', () => {
            vol.writeFileSync('/test/empty-file', '');
            const result = discAccess.read('/test/empty-file');
            expect(result).toBe('');
        });
    });

    describe('mkdir()', () => {
        it('should call fs.mkdirSync with recursive option', () => {
            discAccess.mkdir('/test/test-path');

            expect(vol.existsSync('/test/test-path')).toBe(true);
        });

        it('should create nested directories', () => {
            discAccess.mkdir('/test/nested/path/dir');

            expect(vol.existsSync('/test/nested')).toBe(true);
            expect(vol.existsSync('/test/nested/path')).toBe(true);
            expect(vol.existsSync('/test/nested/path/dir')).toBe(true);
        });
    });

    describe('write()', () => {
        it('should call fs.writeFileSync', () => {
            discAccess.write('/test/test-path', 'file content');

            expect(vol.existsSync('/test/test-path')).toBe(true);
            expect(vol.readFileSync('/test/test-path', 'utf8')).toBe('file content');
        });

        it('should create file with content', () => {
            const content = JSON.stringify({ test: 'data' });
            discAccess.write('/test/data-file.json', content);

            const data = vol.readFileSync('/test/data-file.json', 'utf8');
            expect(data).toBeTypeOf('string');
            const result = JSON.parse(data as string);
            expect(result.test).toBe('data');
        });
    });
});
