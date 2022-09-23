import { Game } from "./Game";
import { render, waitFor, act } from "@testing-library/react";
import { getWrapper, mockSdk } from "./mocks";
import { createStore } from "./store";
import { initializeGame, updateGame } from "./features/game/gameSlice";
import {
  createCard,
  createGameDefinition,
  createGameState,
  createParticipant,
} from "./features/game/objectMother";
import { Game as GamePersistence } from "./features/game/Game";
import { Card, GameDefinition } from "./features/game/types";
import {
  persistGameVote,
  persistParticipantVote,
} from "./features/voting/persistence";
import { updateVote } from "./features/voting/votingSlice";
import "jest-webgl-canvas-mock";
import { range, update } from "lodash";
import { GamePhase, VICTORY_FLAG_NAME, VICTORY_FLAG_VALUE } from "./constants";

jest.mock("textfit");

const renderGame = ({
  card = createCard(),
  store = createStore(),
  gameDefinitionOverride = {},
}: Partial<{
  card: Card;
  store: ReturnType<typeof createStore>;
  gameDefinitionOverride?: Partial<GameDefinition>;
}>) => {
  const gameDefinition = createGameDefinition({
    cards: [card],
    ...gameDefinitionOverride,
  });
  let game = new GamePersistence().startGame(createGameState(gameDefinition));
  const state = game.retrieve();

  store.dispatch({
    type: initializeGame.fulfilled.type,
    payload: gameDefinition,
  });

  store.dispatch(
    updateGame({
      flags: state.flags,
      phase: state.phase,
      round: state.round,
      selectedCard: state.selectedCard,
      stats: state.stats,
      previouslySelectedCardIds: state.previouslySelectedCardIds,
    })
  );

  return render(<Game />, {
    wrapper: getWrapper(store),
  });
};

describe("Game", () => {
  beforeEach(() => {
    mockSdk();
  });
  it("should render 'No' answer", () => {
    const card = createCard({ answer_no: "No!!!" });

    const { getByText } = renderGame({ card });

    expect(getByText("No!!!")).toBeInTheDocument();
  });

  it("should render 'Yes' answer", () => {
    const card = createCard({ answer_yes: "Yes!!!" });

    const { getByText } = renderGame({ card });

    expect(getByText("Yes!!!")).toBeInTheDocument();
  });

  it("should render question", () => {
    const card = createCard({ card: "Question!!!" });

    const { getByText } = renderGame({ card });

    expect(getByText("Question!!!")).toBeInTheDocument();
  });

  it("should render countdown", async () => {
    const store = createStore();
    const { getByTestId } = renderGame({ store });
    persistGameVote({ answer: "Yes", countdown: 3 });

    act(() => {
      store.dispatch(updateVote());
    });

    const countdown = await waitFor(() => getByTestId("countdown"));
    expect(countdown).toHaveTextContent("3...");
  });
  describe("votes missing", () => {
    it("should show votes missing when there are three or less votes missing", () => {
      // 4x remote + 1x local = 5 participants - need 3 votes for majority
      const store = createStore();
      const remoteParticipants = range(0, 4).map((ix) =>
        createParticipant(`${ix + 1}`)
      );
      mockSdk({ remoteParticipants });

      const { getByTestId } = renderGame({ store });
      act(() => {
        store.dispatch(updateVote());
      });

      expect(getByTestId("yes-votes-missing")).toHaveTextContent(
        "3 votes missing"
      );

      persistParticipantVote("1", "Yes");
      act(() => {
        store.dispatch(updateVote());
      });

      expect(getByTestId("yes-votes-missing")).toHaveTextContent(
        "2 votes missing"
      );

      persistParticipantVote("2", "Yes");
      act(() => {
        store.dispatch(updateVote());
      });

      expect(getByTestId("yes-votes-missing")).toHaveTextContent(
        "1 vote missing"
      );
    });

    it("should not show votes missing when more than three votes missing", () => {
      // 5x remote + 1x local = 5 participants - need 4 votes for majority
      const store = createStore();
      const remoteParticipants = range(0, 5).map((ix) =>
        createParticipant(`${ix}`)
      );
      mockSdk({ remoteParticipants });

      const { getByTestId } = renderGame({ store });
      act(() => {
        store.dispatch(updateVote());
      });

      expect(getByTestId("yes-votes-missing")).toHaveTextContent("");
    });

    it("should not show votes missing when no votes are missing", () => {
      // 2x remote + 1x local = 3 participants - need 2 votes for majority
      const store = createStore();
      const remoteParticipants = range(0, 2).map((ix) =>
        createParticipant(`${ix + 1}`)
      );
      mockSdk({ remoteParticipants });

      const { getByTestId } = renderGame({ store });
      persistParticipantVote("1", "Yes");
      persistParticipantVote("2", "Yes");
      act(() => {
        store.dispatch(updateVote());
      });

      expect(getByTestId("yes-votes-missing")).toHaveTextContent("");
    });
  });

  describe("On victory after victorythreshold", () => {
    const renderWiningGame = () => {
      const store = createStore();

      const { findByText, findByTestId, queryByTestId } = renderGame({
        store,
        gameDefinitionOverride: {
          victoryMessage: "You made it !",
          victoryRoundThreshold: 33,
        },
      });

      store.dispatch(
        updateGame({
          ...store.getState().game,
          phase: GamePhase.ENDED,
          round: 33,
          flags: {
            [VICTORY_FLAG_NAME]: VICTORY_FLAG_VALUE,
          },
        })
      );

      return { findByText, findByTestId, queryByTestId };
    };

    it("shows victory message", async () => {
      const { findByText } = renderWiningGame();

      await findByText("You made it !");
    });

    it("shows correct round value", async () => {
      const { queryByTestId } = renderWiningGame();

      await waitFor(() =>
        expect(queryByTestId("round-label")?.textContent).toBe("Day 33 / 33")
      );
    });
  });
});
