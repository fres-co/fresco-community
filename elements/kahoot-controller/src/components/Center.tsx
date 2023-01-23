import { Styled } from "./Styled";

export const Center = ({ ...props }) => (
  <Styled
    el={<div />}
    css={`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      flex-direction: column;
    `}
    {...props}
  />
);
