import { render } from "@testing-library/react";
import { GamePhase } from "./constants";
import { updateGame } from "./features/game/gameSlice";
import { createGameDefinition } from "./features/game/objectMother";
import { Header } from "./Header";
import { getWrapper } from "./mocks";
import { createStore } from "./store";

describe("Header", () => {
  let store: ReturnType<typeof createStore>;
  beforeEach(() => {
    store = createStore();
  });

  const renderHeader = () =>
    render(
      <Header
        definition={createGameDefinition()}
        stats={[]}
        round={1}
        phase={GamePhase.STARTED}
      />,
      { wrapper: getWrapper(store) }
    );

  const setFlags = (flags: Record<string, string>) =>
    store.dispatch(
      updateGame({
        flags,
        stats: [],
        round: 1,
        phase: GamePhase.STARTED,
        previouslySelectedCardIds: [],
        selectedCard: null,
      })
    );

  it("should be hidden when show_resources not yet set", () => {
    setFlags({});

    const { getByTestId } = renderHeader();

    expect(getByTestId("header")).toHaveClass("hidden");
  });

  it("should be hidden when show_resources is false", () => {
    setFlags({ show_resources: "false" });

    const { getByTestId } = renderHeader();

    expect(getByTestId("header")).toHaveClass("hidden");
  });

  it("should be visible when show_resources is true", () => {
    setFlags({ show_resources: "true" });

    const { getByTestId } = renderHeader();

    expect(getByTestId("header")).not.toHaveClass("hidden");
  });
});
