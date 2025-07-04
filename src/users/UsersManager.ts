import fs from 'fs';

import { UserInfo } from './UserInfo.js';

/**
 * A manager which will handle all user data queries. It will load and save data on disc when needed and will avoid
 * inconsistency on accessed data.
 */
export class UsersManager {

    private usersCache: UsersCache = {};
    private usersHolders: UsersHolder = {};

    constructor(private discAccess: DiscAccess) {
        if (!this.discAccess.exists('data')) {
            this.discAccess.mkdir('data');
        }
        if (!this.discAccess.exists('data/users')) {
            this.discAccess.mkdir('data/users');
        }
    }

    public getUser(querySession: QuerySession, userId: string): UserInfo {
        let user: UserInfo | null;

        // First search for cached value
        user = this.getFromCache(userId);

        // If no cached value, try to load from a file
        if (user === null) {
            user = this.getFromFile(userId);
        }

        // If loading from a file failed, create data
        if (user === null) {
            user = new UserInfo(`
                {
                    "discordId": "${userId}"
                }
            `);
        }

        this.cacheUser(user);
        this.setOwned(user, querySession);

        return user;
    }

    getFromCache(userId: string): UserInfo | null {
        if (this.usersCache[userId]) {
            return this.usersCache[userId];
        }
        return null;
    }

    /**
     * Tries to read user information from a file.
     *
     * @param userId the id of the user
     * @returns the user info or null if info can't be read from a file
     */
    getFromFile(userId: string): UserInfo | null {
        if (this.discAccess.exists(`data/users/${userId}.json`)) {
            try {
                const jsonStr: string = this.discAccess.read(`data/users/${userId}.json`);
                return new UserInfo(jsonStr);
            }
            catch (err) {
                console.log(err);
            }
        }
        return null;
    }

    /**
     * Cache the given user data to be able to retrieve it when asked twice.
     *
     * @param user the user is to cache
     */
    cacheUser(user: UserInfo): void {
        if (!this.usersCache[user.getDiscordId()]) {
            this.usersCache[user.getDiscordId()] = user;
        }
    }

    /**
     * Set the given user data owned by a given query session.
     * The same user data can be owned by multiple query sessions.
     *
     * @param user the user which will be owned by the given query sessions
     * @param querySession the QuerySession chich will own the given user data
     */
    setOwned(user: UserInfo, querySession: QuerySession): void {
        if (!this.usersHolders[user.getDiscordId()]) {
            this.usersHolders[user.getDiscordId()] = [];
        }

        if (this.usersHolders[user.getDiscordId()].indexOf(querySession) === -1) {
            this.usersHolders[user.getDiscordId()].push(querySession);
        }
    }

    /**
     * Free all users from the given query session.
     *
     * @param querySession the query session the users must be free from
     */
    freeFromOwner(querySession: QuerySession): void {
        Object.values(this.usersHolders).forEach((v: Array<QuerySession>) => {
            const index: number = v.indexOf(querySession);
            if (index !== -1) {
                delete v[index];
            }
        });
    }

    /**
     * Iterates through all cached data, then uncache it if this one is totally free.
     */
    uncacheFreeData() {
        Object.keys(this.usersHolders).forEach(id => {
            if (this.usersHolders[id].entries.length === 0) {
                const cachedValue: UserInfo = this.usersCache[id];

                this.discAccess.write(`data/users/${cachedValue.getDiscordId()}.json`, JSON.stringify(cachedValue, null, '\t'));

                delete this.usersCache[id];
                delete this.usersHolders[id];

            }
        });
    }

    /**
     * Begins a query session. Use the returned object to query user data.
     */
    public beginSession(): QuerySession {
        return new QuerySession(this);
    }

    /**
     * Ends a query session. All data held for this session will be free.
     *
     * @param querySession the query sessions to end
     */
    public endSession(querySession: QuerySession): void {
        this.freeFromOwner(querySession);
        this.uncacheFreeData();
    }

}

export class QuerySession {

    constructor(private manager: UsersManager) {
    }

    public getUser(userId: string): UserInfo {
        return this.manager.getUser(this, userId);
    }

}

interface UsersCache {
    [userId: string]: UserInfo;
}

interface UsersHolder {
    [userId: string]: Array<QuerySession>;
}

export class DiscAccess {

    public exists(path: string): boolean {
        return fs.existsSync(path);
    }

    public read(path: string): string {
        return fs.readFileSync(path, { encoding: 'utf8' });
    }

    public mkdir(path: string): void {
        fs.mkdirSync(path, { recursive: true });
    }

    public write(path: string, data: string): void {
        fs.writeFileSync(path, data);
    }
}
