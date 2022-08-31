import { Header } from "../Header";
import { Question } from "../Question";
import { AnswerArea } from "../AnswerArea";
import { Countdown } from "../Countdown";
import { Card, GameDefinition, MenuCard } from "../features/game/types";
import { OptionalAnswerText } from "../OptionalAnswerText";
import { GamePhase } from "../constants";
import { Message } from "../Message";
import { RoundLabel } from "../RoundLabel";

export const VotingScreen = ({
  gameDefinition,
  currentStats,
  round,
  selectedCard,
  noProgress,
  yesProgress,
  noVotesMissing,
  yesVotesMissing,
  countdown,
  phase,
}: {
  gameDefinition: GameDefinition;
  currentStats: number[];
  round: number;
  selectedCard: Card | MenuCard;
  noProgress: number;
  yesProgress: number;
  noVotesMissing: number | null;
  yesVotesMissing: number | null;
  countdown: Countdown;
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
      {phase === GamePhase.STARTED && <Question card={selectedCard as Card} />}
      {phase !== GamePhase.STARTED && (
        <Message
          message={selectedCard.card}
          maxFontSize={phase === GamePhase.ENDED ? 86 : undefined}
        />
      )}
      <div className="answers">
        <OptionalAnswerText
          visible={Boolean(selectedCard.answer_no)}
          text={selectedCard.answer_no}
          answer="no"
          progress={noProgress}
          color="#e200a4"
          votesMissing={noVotesMissing}
        />

        <div className="answer">
          <div className="round">
            <RoundLabel round={round} gameDefinition={gameDefinition} />
          </div>
        </div>
        <OptionalAnswerText
          visible={Boolean(selectedCard.answer_yes)}
          text={selectedCard.answer_yes}
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
