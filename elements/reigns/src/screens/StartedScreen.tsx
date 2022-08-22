import React from "react";
import { Header } from "../Header";
import { Question } from "../Question";
import { AnswerArea } from "../AnswerArea";
import { Countdown } from "../Countdown";
import { Card, GameDefinition } from "../features/game/types";
import { OptionalAnswerText } from "../OptionalAnswerText";
import { GamePhase } from "../constants";
import { Message } from "../Message";

export const StartedScreen = ({
  gameDefinition,
  currentStats,
  round,
  selectedCard,
  noProgress,
  yesProgress,
  noVotesMissing,
  yesVotesMissing,
  countdown,
  doRestartGame,
  phase,
}: {
  gameDefinition: GameDefinition;
  currentStats: number[];
  round: number;
  selectedCard: Card;
  noProgress: number;
  yesProgress: number;
  noVotesMissing: number | null;
  yesVotesMissing: number | null;
  countdown: Countdown;
  doRestartGame: () => void;
  phase: GamePhase;
}) => (
  <>
    <div className="screen game--started">
      <Header
        definition={gameDefinition}
        stats={currentStats}
        round={round}
        phase={phase}
      />
      {phase === GamePhase.STARTED && <Question card={selectedCard} />}
      {phase !== GamePhase.STARTED && (
        <Message
          message={selectedCard.card}
          maxFontSize={phase === GamePhase.ENDED ? 86 : undefined}
        />
      )}
      <div className="answers">
        <OptionalAnswerText
          visible={Boolean(selectedCard.answer_no)}
          text={selectedCard.answer_no || "No"}
          answer="no"
          progress={noProgress}
          color="#e200a4"
          votesMissing={noVotesMissing}
        />

        <div className="answer">
          <div className="round">
            {round !== 0 && `${gameDefinition.roundName} ${round}`}
          </div>
        </div>
        <OptionalAnswerText
          visible={Boolean(selectedCard.answer_yes)}
          text={selectedCard.answer_yes || "Yes"}
          answer="yes"
          progress={yesProgress}
          color="#9e32d6"
          votesMissing={yesVotesMissing}
        />
      </div>
    </div>
    <div className="answers floor">
      <AnswerArea answer="no" visible={Boolean(selectedCard.answer_no)} />
      <div className="answer answer--neutral">
        {countdown?.isVoting && (
          <div className="countdown" data-testid="countdown">
            <>{countdown.value}...</>
          </div>
        )}
      </div>
      <AnswerArea answer="yes" visible={Boolean(selectedCard.answer_yes)} />
    </div>
  </>
);
