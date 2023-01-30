import { useReducer, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { KahootPlayer } from "./screens/kahootPlayer";

import { SettingScreen } from "./screens/settingScreen";
import { WaitPin } from "./screens/waitPin";

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

export function App() {
  const { state, dispatch } = useAppStore();
  const setPin = useCallback(
    (pin: number | "") => {
      dispatch({ type: ACTIONS.SET_PIN, payload: { pin } });
    },
    [dispatch]
  );

  const resetPin = useCallback(() => setPin(""), [setPin]);
  if (!state.loaded) {
    return null;
  }

  if (state.pin) {
    return (
      <KahootPlayer
        pin={`${state.pin}`}
        canSetPin={state.canSetPin}
        resetPin={resetPin}
      />
    );
  }

  if (state.canSetPin) {
    return <SettingScreen setPin={setPin} />;
  }

  return <WaitPin />;
}
