import React, { useEffect, useRef } from "react";
import { Styled } from "../components/Styled";

let haveLocalStorage = false;
try {
  haveLocalStorage = Boolean(window.localStorage);
} catch {
  // no local storage
}

function getControllerUrl() {
  // Allows to point to different environments
  const url = new URL(window.location.href);
  const controllerUrl = url.searchParams.get("controllerUrl");
  return controllerUrl || "https://kahoot.it";
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
  const isMounted = React.useRef(false);
  useEffect(() => {
    isMounted.current = true;
  }, []);

  const url = new URL(getControllerUrl());
  const prevUrlRef = useRef(url);
  const savedPin = React.useMemo(
    () => window.localStorage.getItem("kahoot-pin"),
    [pin]
  );

  useEffect(() => {
    if (pin && savedPin !== `${pin}`) {
      window.localStorage.setItem("kahoot-pin", `${pin}`);
    }
  }, [pin, savedPin]);

  if (pin && savedPin !== `${pin}`) {
    url.searchParams.set("pin", pin);
    url.searchParams.set(
      "nickname",
      (window as any).fresco.localParticipant.name
    );
    prevUrlRef.current = url;
  } else if (isMounted.current === false) {
    // pin is same as before but element is not mounted
    // lets try to continue game
    url.pathname += url.pathname.startsWith("/") ? "start" : "/start";
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
    </>
  );
};

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
      <Styled css="position: absolute; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background-color: #321066; height: 100%; color:white; line-height: 2.2rem; font-size: 24px; font-weight: bold;">
        <h2>Cannot open this Kahoot</h2>
        <p>
          If you are using incognito mode, please reopen in non-incognito mode.
        </p>
      </Styled>
    );
  }

  return (
    <KahootPlayerWithStorage
      pin={pin}
      resetPin={resetPin}
      canSetPin={canSetPin}
    />
  );
};
