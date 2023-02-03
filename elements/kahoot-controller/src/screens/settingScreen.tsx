import { useCallback, useState } from "react";
import { Center } from "../components/Center";
import { Form } from "../components/Form";
import { Styled } from "../components/Styled";

export const SettingScreen = ({
  setPin,
}: {
  setPin: (pin: number) => void;
}) => {
  const [editingPin, setEditingPin] = useState<number | "">("");
  const validatePin = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.value === "") {
        setEditingPin("");
      } else {
        const pin = Number.parseInt(e.currentTarget.value);
        if (!Number.isNaN(pin) && `${pin}` === e.currentTarget.value) {
          setEditingPin(pin);
        }
      }
    },
    [setEditingPin]
  );

  return (
    <Styled css="font-size: 48px; height: 100%; background-color: rgb(56, 18, 114)">
      <Center>
        <KahootLogo />
        <Form
          autoComplete="off"
          css="border-radius: 4px"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            var formData = new FormData(e.currentTarget);
            const { pin } = Object.fromEntries(formData);
            e.preventDefault();
            setPin(Number.parseInt(pin as string, 10));
          }}
        >
          <Styled
            el={<input />}
            css={`
              height: 40px;
              text-align: center;
              margin: 4px;
              background-color: white;
              border-radius: 4px;
            `}
            type="text"
            autoComplete="off"
            name="pin"
            placeholder={"Game PIN"}
            value={editingPin}
            onInput={validatePin}
          />
          <Styled
            el={<input />}
            css={`
              height: 50px;
              text-align: center;
              margin: 4px;
              background-color: #333;
              border-radius: 4px;
              color: white;
              font-weight: bold;
              font-size: 18px;
              padding: 8px;
            `}
            type="submit"
            value="Set Pin"
          />
        </Form>
      </Center>
    </Styled>
  );
};

export const KahootLogo = () => (
  <Styled css='background: url("//assets-cdn.kahoot.it/controller/v2/assets/icn_kahoot_logo-58b66a21.svg") center bottom no-repeat; height: 65px; width: 200px; margin-bottom: 2rem;' />
);
