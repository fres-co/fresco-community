import React from "react";

export const Question = ({ card }) => {
    return (
      <div className="block question">
        <div className="question__image">
          <img src={`${card.bearer}.png`} />
          {card.bearer}
        </div>
        <div className="question__text">{card.card}</div>
      </div>
    );
  };