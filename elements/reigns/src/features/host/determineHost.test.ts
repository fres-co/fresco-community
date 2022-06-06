import { determineHost, HOST_KEY } from "./determineHost";
import { GAME_TABLE } from "../game/Game";

const mockRealtime = {
  set: jest.fn(),
};
jest.mock("../../sdk", () => ({
  getSdk: () =>
    ({
      storage: {
        realtime: mockRealtime,
      },
    } as unknown as IFrescoSdk),
}));

describe("determineHost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const createParticipant = (id: string): Participant => ({ id, name: id });
  it("chooses an eligible host by alphabetic id order", () => {
    const host = determineHost({
      mounted: { b: true, a: true, c: true },
      remoteParticipants: [createParticipant("b"), createParticipant("a")],
      localParticipant: createParticipant("c"),
      currentHost: null,
    });
    expect(host?.id).toBe("a");
  });
  it("should exclude disconnected players", () => {
    const host = determineHost({
      mounted: { a: true, b: true },
      remoteParticipants: [],
      localParticipant: createParticipant("b"),
      currentHost: null,
    });
    expect(host?.id).toBe("b");
  });

  it("should exclude unmounted players", () => {
    const host = determineHost({
      mounted: { b: true },
      remoteParticipants: [createParticipant("a")],
      localParticipant: createParticipant("b"),
      currentHost: null,
    });
    expect(host?.id).toBe("b");
  });

  it("should choose previous host if still eligible", () => {
    const host = determineHost({
      mounted: { a: true, b: true },
      remoteParticipants: [createParticipant("b")],
      localParticipant: createParticipant("a"),
      currentHost: createParticipant("b"),
    });
    expect(host?.id).toBe("b");
  });
  it("should choose new host if previous host not eligible", () => {
    const host = determineHost({
      mounted: { a: true },
      remoteParticipants: [createParticipant("b")],
      localParticipant: createParticipant("a"),
      currentHost: createParticipant("b"),
    });
    expect(host?.id).toBe("a");
  });

  describe("on host change", () => {
    it("should persist new host if current user", () => {
      determineHost({
        mounted: { a: true },
        remoteParticipants: [createParticipant("b")],
        localParticipant: createParticipant("a"),
        currentHost: createParticipant("b"),
      });
      expect(mockRealtime.set).toBeCalledWith(
        GAME_TABLE,
        HOST_KEY,
        expect.objectContaining({ id: "a" })
      );
    });

    it("should not persist new host, if new host is another user", () => {
      determineHost({
        mounted: { a: true },
        remoteParticipants: [createParticipant("a")],
        localParticipant: createParticipant("b"),
        currentHost: createParticipant("a"),
      });
      expect(mockRealtime.set).not.toBeCalled();
    });
  });
});
