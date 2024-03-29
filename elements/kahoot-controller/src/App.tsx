import React, {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import "./App.css";
import { KahootPlayer } from "./screens/KahootPlayer";

import { SettingScreen } from "./screens/SettingScreen";
import { WaitPin } from "./screens/WaitPin";
import { Styled } from "./components/Styled";

interface FrescoElementState {
  pin: number | "";
}
declare var fresco: {
  element: {
    id: string;
    state: any;
  };
  onReady(callback: () => void): void;
  initialize: (state: Partial<FrescoElementState>, config: any) => void;
  setState: (state: Partial<FrescoElementState>) => void;
  onStateChanged: (cb: () => void) => void;
  localParticipant: {
    permission: {
      canAccess: boolean;
      canEdit: boolean;
      canLock: boolean;
      canConfig: boolean;
    };
  };
};

enum ACTIONS {
  FRESCO_READY,
  FRESCO_STATE_CHANGED,
  SET_PIN,
}

interface StoreState {
  loaded: boolean;
  pin: number | "";
  canSetPin: boolean;
}

interface FRESCO_READY_ACTION {
  type: ACTIONS.FRESCO_READY;
}

interface SET_PIN_ACTION {
  type: ACTIONS.SET_PIN;
  payload: { pin: number | "" };
}

interface FRESCO_STATE_CHANGED_ACTION {
  type: ACTIONS.FRESCO_STATE_CHANGED;
}

type StoreAction =
  | FRESCO_READY_ACTION
  | FRESCO_STATE_CHANGED_ACTION
  | SET_PIN_ACTION;

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  if (action.type === ACTIONS.FRESCO_READY) {
    fresco.initialize({ pin: "" }, {});
    return { ...state, loaded: true };
  }

  if (action.type === ACTIONS.FRESCO_STATE_CHANGED) {
    return {
      ...state,
      canSetPin: fresco.localParticipant.permission.canEdit,
      pin: fresco.element.state.pin,
    };
  }

  if (action.type === ACTIONS.SET_PIN) {
    fresco.setState({ pin: action.payload.pin });
  }
  return state;
};

const initialState: StoreState = { loaded: false, canSetPin: false, pin: "" };

const useAppStore = () => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;

      fresco.onReady(() => {
        fresco.onStateChanged(() => {
          dispatch({
            type: ACTIONS.FRESCO_STATE_CHANGED,
          });
        });

        dispatch({
          type: ACTIONS.FRESCO_READY,
        });
      });
    }
  }, []);

  return { state, dispatch };
};

export function KahootApp() {
  useEffect(() => {
    fresco.onReady(() => {
      const sdk = (window as any).fresco;
      sdk.subscribeToGlobalEvent(
        "custom.setKahootPin",
        (payload: {
          eventValue: string | number | boolean;
          source: string;
          eventName: string;
        }) => {
          fresco.setState({ pin: parseInt(payload.eventValue + "") });
        }
      );
    });
  }, []);

  const { state, dispatch } = useAppStore();
  const setPin = useCallback(
    (pin: number | "") => {
      dispatch({ type: ACTIONS.SET_PIN, payload: { pin } });
    },
    [dispatch]
  );

  const [isResetPinModalVisible, setResetPinModalVisible] = useState(false);
  const confirmBeforeResetPin = useCallback(() => {
    setResetPinModalVisible(true);
  }, [setPin]);

  const discardResetPin = useCallback(() => {
    setResetPinModalVisible(false);
  }, [setPin]);

  const resetPin = useCallback(() => {
    setResetPinModalVisible(false);
    setPin("");
  }, [setPin]);

  if (!state.loaded) {
    return null;
  }

  if (state.pin && isResetPinModalVisible) {
    return (
      <PhoneWrapper>
        <Confirm onOk={resetPin} onDismiss={discardResetPin} />
      </PhoneWrapper>
    );
  }

  if (state.pin) {
    return (
      <PhoneWrapper>
        <KahootPlayer
          pin={`${state.pin}`}
          canSetPin={state.canSetPin}
          resetPin={confirmBeforeResetPin}
        />
      </PhoneWrapper>
    );
  }

  if (state.canSetPin) {
    return (
      <PhoneWrapper>
        <SettingScreen setPin={setPin} />
      </PhoneWrapper>
    );
  }

  return (
    <PhoneWrapper>
      <WaitPin />
    </PhoneWrapper>
  );
}

const PhoneWrapper = ({ children }: { children: React.ReactElement }) => {
  return (
    <div className="gJaRNL">
      <div className="inner"></div>
      <div className="overflow">
        <div className="shadow"></div>
      </div>
      <div className="speaker"></div>
      <div className="sensors"></div>
      <div className="more-sensors"></div>
      <div className="sleep"></div>
      <div className="volume"></div>
      <div className="camera"></div>
      <div className="screen">{children}</div>
    </div>
  );
};

const Confirm = ({
  onOk,
  onDismiss,
}: {
  onOk: () => void;
  onDismiss: () => void;
}) => {
  return (
    <div className="confirm">
      <div className="confirm-box">
        <div className="confirm--prompt">
          <h3>Do you want to reset the Game&nbsp;PIN?</h3>
          This will disconnect all players.
        </div>

        <div className="confirm--button-container">
          <button className="confirm--button confirm--button-ok" onClick={onOk}>
            Reset Game PIN
          </button>
          <button
            className="confirm--button confirm--button-cancel"
            onClick={onDismiss}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const checkStorage = (name: "localStorage" | "sessionStorage") => {
  try {
    const storage = window[name];
    storage.setItem("test-storage", "success");
    const status = storage.getItem("test-storage");
    return status === "success";
  } catch (e) {
    return false;
  }
};

export const App = () => {
  const isStorageAvailable = React.useMemo(() => {
    return checkStorage("localStorage") && checkStorage("sessionStorage");
  }, []);

  if (isStorageAvailable) {
    return <KahootApp />;
  }

  return (
    <PhoneWrapper>
      <Styled
        css="
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
    background-color: rgb(56, 18, 114);
    "
      >
        <h3>This browser is not compatible.</h3>
        Are you using private mode?
      </Styled>
    </PhoneWrapper>
  );
};
