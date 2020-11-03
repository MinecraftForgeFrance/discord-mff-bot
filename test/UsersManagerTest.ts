import { expect } from "chai";
import { anyString, instance, mock, resetCalls, spy, verify, when } from "ts-mockito";

import { UserInfo } from "../src/user/UserInfo";
import { DiscAccess, QuerySession, UsersManager } from "../src/user/UsersManager";

describe("UsersManager", () => {

    describe("#getUser()", () => {

        const session: QuerySession = mock(QuerySession);
        const mockedAccess: DiscAccess = mock(DiscAccess);
        when(mockedAccess.exists("data")).thenReturn(true);
        when(mockedAccess.exists("data/users")).thenReturn(true);
        when(mockedAccess.exists("data/users/266241948824764416.json")).thenReturn(true);
        when(mockedAccess.read("data/users/266241948824764416.json")).thenReturn(`
            {
                "discordId": "266241948824764416",
                "banned": true,
                "forumId": "1458"
            }
        `);

        beforeEach(() => {
            resetCalls(mockedAccess);
        });

        it("User is read from cache if the user is cached", () => {
            const manager: UsersManager = new UsersManager(instance(mockedAccess));
            const spiedManager: UsersManager = spy(manager);
            const mockedUser: UserInfo = mock(UserInfo);

            when(mockedUser.getDiscordId()).thenReturn("266241948824764416");
            when(spiedManager.getFromCache("266241948824764416")).thenReturn(instance(mockedUser));

            const user: UserInfo = manager.getUser(session, "266241948824764416");

            verify(spiedManager.getFromCache("266241948824764416")).once();
            verify(spiedManager.getFromFile(anyString())).never();

            expect(user).to.equal(instance(mockedUser));

        });

        it("User is read from file if the user is no cached", () => {
            const manager: UsersManager = new UsersManager(instance(mockedAccess));
            const spiedManager: UsersManager = spy(manager);

            when(spiedManager.getFromCache("266241948824764416")).thenReturn(null);

            const user: UserInfo = manager.getUser(session, "266241948824764416");

            verify(spiedManager.getFromCache("266241948824764416")).once();
            verify(mockedAccess.exists("data/users/266241948824764416.json")).once();
            verify(mockedAccess.read("data/users/266241948824764416.json")).once();

            expect(user.getDiscordId()).to.equal("266241948824764416");
            expect(user.isBanned()).to.be.true;
            expect(user.getForumId()).to.equal("1458");
        });

        it("User is created if can't be read from cache nor file", () => {
            const manager: UsersManager = new UsersManager(instance(mockedAccess));
            const spiedManager: UsersManager = spy(manager);

            when(spiedManager.getFromCache(anyString())).thenReturn(null);
            when(spiedManager.getFromFile(anyString())).thenReturn(null);

            const user: UserInfo = manager.getUser(session, "266241948824764416");

            verify(spiedManager.getFromCache("266241948824764416")).once();
            verify(spiedManager.getFromFile(anyString())).once();

            expect(user.getDiscordId()).to.equal("266241948824764416");
            expect(user.isBanned()).to.be.false;
            expect(user.getForumId()).to.be.null;
        });

    });

});

describe("QuerySession", () => {

    describe("#getUser()", () => {

        it("Expect call to be delegated to users manager", () => {
            const manager: UsersManager = mock(UsersManager);
            const session: QuerySession = new QuerySession(instance(manager));

            session.getUser("266241948824764416");

            verify(manager.getUser(session, "266241948824764416")).once();

        });

    });

});
