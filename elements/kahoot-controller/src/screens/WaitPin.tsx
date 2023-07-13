import { Styled } from "../components/Styled";

export const WaitPin = () => (
  <Styled
    css="
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    font-size: 24px;
    padding: 2rem;
    background-color: rgb(56, 18, 114);
    "
  >
    Waiting for the admin to start the Kahoot...
  </Styled>
);
