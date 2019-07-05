import { expect } from "chai";
import { GuildMember, Message, TextChannel, Role, Snowflake, Collection } from "discord.js";
import { instance, mock, reset, when } from "ts-mockito";
import { PermissionCheck } from "../src/commands/Command";
import { UserInfo } from "../src/user/UserInfo";
import { CommandContext } from "../src/commands/CommandContext";
import { PermissionBuilder } from "../src/commands/permission/PermissionBuilder";

describe("PermissionBuilder", () => {

    const mockedUser: UserInfo = mock(UserInfo);
    const mockedCtx: CommandContext = mock(CommandContext);
    const mockedMessage: Message = mock(Message);
    const mockedChannel: TextChannel = mock(TextChannel);
    const mockedMember: GuildMember = mock(GuildMember);

    when(mockedCtx.getMessage()).thenReturn(instance(mockedMessage));
    when(mockedMessage.channel).thenReturn(instance(mockedChannel));
    instance(mockedMessage).member = instance(mockedMember);

    beforeEach(() => {
        reset(mockedChannel);
        reset(mockedMember);
    });

    it("Correctly checks channel name", () => {
        when(mockedChannel.name).thenReturn("theName");
        when(mockedChannel.type).thenReturn("text");

        let checker: PermissionCheck = PermissionBuilder.new().channelNameIs("theName").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.true;

        checker = PermissionBuilder.new().channelNameIs("otherName").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.false;
    });

    it("Correctly checks channel type", () => {
        when(mockedChannel.type).thenReturn("dm");

        let checker: PermissionCheck = PermissionBuilder.new().channelTypeIs("dm").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.true;

        checker = PermissionBuilder.new().channelTypeIs("text").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.false;
    });

    it("Correctly checks member permission", () => {
        when(mockedMember.hasPermission("ADD_REACTIONS")).thenReturn(true);
        when(mockedMember.hasPermission("ADMINISTRATOR")).thenReturn(false);

        let checker: PermissionCheck = PermissionBuilder.new().hasPermission("ADD_REACTIONS").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.true;

        checker = PermissionBuilder.new().hasPermission("ADMINISTRATOR").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.false;
    });

    it("Correctly checks member roles", () => {
        const mockedRole: Role = mock(Role);
        const collection = new Collection<Snowflake, Role>();
        collection.set("theRole", instance(mockedRole));

        when(mockedMember.roles).thenReturn(collection);

        let checker: PermissionCheck = PermissionBuilder.new().hasRole("theRole").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.true;

        checker = PermissionBuilder.new().hasRole("otherRole").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.false;
    });

    it("Correctly compose conditions", () => {
        when(mockedChannel.type).thenReturn('dm');
        when(mockedMember.hasPermission("ATTACH_FILES")).thenReturn(true);
        when(mockedMember.hasPermission("ADMINISTRATOR")).thenReturn(false);

        let checker: PermissionCheck = PermissionBuilder.new().hasPermission("ATTACH_FILES").channelTypeIs("dm").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.true;

        checker = PermissionBuilder.new().hasPermission("ADMINISTRATOR").channelTypeIs("dm").build();
        expect(checker(instance(mockedUser), instance(mockedCtx))).to.be.false;
    });

});