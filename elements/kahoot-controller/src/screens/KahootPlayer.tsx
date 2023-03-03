const KahootURL = "https://kahoot.it";

import React, { useEffect, useRef } from "react";
import { Styled } from "../components/Styled";

let haveLocalStorage = false;
try {
  haveLocalStorage = Boolean(window.localStorage);
} catch {
  // no local storage
}


const KahootPlayerWithStorage = ({
  pin,
  canSetPin,
  resetPin,
}: {
  pin?: string;
  canSetPin: boolean;
  resetPin: () => void;
}) => {

  const isMounted = React.useRef(false)
  useEffect(() => {
    isMounted.current = true;
  }, []);


  const url = new URL(KahootURL);
  const prevUrlRef = useRef(url);
  const savedPin = React.useMemo(() => window.localStorage.getItem('kahoot-pin'), [pin]);

  useEffect(() => {
    if (pin && savedPin !== `${pin}`) {
      window.localStorage.setItem('kahoot-pin', `${pin}`);
    }
  }, [pin, savedPin])

  if (pin && savedPin !== `${pin}`) {
    url.searchParams.set("pin", pin);
    prevUrlRef.current = url;
  } else if (isMounted.current === false) {
    // pin is same as before but element is not mounted
    // lets try to continue game
    url.pathname = '/start';
    prevUrlRef.current = url;
  }

  return (
    <>
      <Styled
        el={<iframe src={prevUrlRef.current.toString()} />}
        css={`
            width: 100%;
            height: 100%;
            border: none;
        }`}
      />
      {canSetPin && (
        <Styled
          css={`
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 10px;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            background: white;
            color: #371271;
          `}
          onClick={resetPin}
        >
          RESET PIN
        </Styled>
      )}
    </>);

}

export const KahootPlayer = ({
  pin,
  canSetPin,
  resetPin,
}: {
  pin?: string;
  canSetPin: boolean;
  resetPin: () => void;
}) => {


  if (!haveLocalStorage) {
    return (
      <Styled css="text-align: center; padding-top: 30px; background-color: rgb(56, 18, 114); height: 100%; color:white; font-size: 24px; font-weight: bold;">
        Sorry, looks like you can not access this Kahoot!
        <br />
        Are you using incognito mode ?<br />
        if so, please reopen in non-incognito mode.
      </Styled>
    );
  }

  return <KahootPlayerWithStorage pin={pin} resetPin={resetPin} canSetPin={canSetPin} />;

};
