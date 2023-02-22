import React, { useCallback, useEffect, useState } from "react";

const MAX_ANSWER_CHARACTERS = 50;
const ANSWERS_STORAGE = "answers";

const initialState = {
  question: "What is your favorite color?",
  maxAnswersPerParticipant: 1,
  blurAnswersUntilParticipantAnswers: false,
  borderRadius: 10,
  backgroundColor: "#fff",
  textColor: "#000",
};

const hash = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const colors = [
  "#F6C2D9",
  "#FFF69B",
  "#BCDFC9",
  "#A1C8E9",
  "#E4DAE2",
  "#D9DDFC",
];

const useForceUpdate = () => {
  const [_, updateCount] = useState(0);
  return useCallback(() => {
    updateCount((c) => c + 1);
  }, []);
};

const Home = () => {
  const [newAnswerText, setNewAnswerText] = useState("");
  const [ready, setReady] = useState(false);
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    if (!fresco) {
      return;
    }

    fresco.onReady(() => {
      setReady(true);
      fresco.onStateChanged(() => {
        forceUpdate();
      });
      fresco.initialize(initialState, {
        title: "Answer Board",
        autoAdjustHeight: true,
        toolbarButtons: [
          {
            title: "Title color",
            ui: { type: "color" },
            property: "titleColor",
          },
          {
            title: "Background color",
            ui: { type: "color" },
            property: "backgroundColor",
          },
          {
            title: "Border radius",
            ui: { type: "slider", min: 0, max: 200 },
            property: "borderRadius",
          },
          {
            title: "Question",
            ui: { type: "string" },
            property: "question",
          },
          {
            title: "Max answers per participant",
            ui: { type: "number" },
            property: "maxAnswersPerParticipant",
          },
          {
            title: "Blur answers until participant answers?",
            ui: { type: "checkbox" },
            property: "blurAnswersUntilParticipantAnswers",
          },
        ],
      });
    });
  }, []);

  if (!ready || !fresco.element.state) {
    return <div className='big-message'>Initialising...</div>;
  }

  const answers = fresco.element?.storage[ANSWERS_STORAGE] || [];

  const myAnswerCount = answers.filter(
    (a) => a.ownerId === fresco.localParticipant.identityId
  ).length;

  const allowedAnswers = fresco.element.state.maxAnswersPerParticipant;
  const backgroundColor = fresco.element.state.backgroundColor;
  const borderRadius = fresco.element.state.borderRadius;
  const titleColor = fresco.element.state.titleColor;

  const canAddAnswer = myAnswerCount < allowedAnswers;
  const hasAnswered = myAnswerCount > 0;

  const answerStyle =
    !hasAnswered && fresco.element.state.blurAnswersUntilParticipantAnswers
      ? {
          color: "transparent",
          "text-shadow": "0 0 8px #000",
        }
      : null;

  const addAnswer = (e) => {
    const value = newAnswerText.trim();
    if (value) {
      fresco.storage.add(ANSWERS_STORAGE, value);
      setNewAnswerText("");
    }
    e.preventDefault();
  };

  const deleteAnswer = (e, id) => {
    e.preventDefault();
    fresco.storage.remove(ANSWERS_STORAGE, id);
  };

  return (
    <div className='app' style={{ backgroundColor, borderRadius }}>
      {!!fresco?.element?.state?.question && <h1 style={{ color: titleColor }}>{fresco?.element?.state?.question}</h1>}
      
      {answers.length ? (
        <ul>
          {answers.map((answer) => (
            <li
              key={answer.id}
              style={{
                ...answerStyle,
                backgroundColor: colors[hash(answer.ownerId) % colors.length],
              }}
            >
              {answer.value}{" "}
              {answer.ownerId === fresco.localParticipant.identityId && (
                <button
                  onClick={(e) => deleteAnswer(e, answer.id)}
                  className='button--delete'
                >
                  ✘
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className='explanation'>No answers yet, add your own!</p>
      )}

      <form>
        <input
          type="text"
          name="comment"
          disabled={!canAddAnswer}
          placeholder="Add your answer"
          value={newAnswerText}
          maxLength={MAX_ANSWER_CHARACTERS}
          onChange={(e) => setNewAnswerText(e.target.value)}
        />
        <button disabled={!canAddAnswer} onClick={addAnswer}>
          Add answer
        </button>
      </form>
    </div>
  );
};

export default function App() {
  return <Home />;
}
