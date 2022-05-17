interface IToolbarButton {
  title: string;
  ui: { type: string };
  property: string;
}

interface IInitializeOptions {
  title: string;
  toolbarButtons: IToolbarButton[];
}

type AppearanceValue =
  | string
  | number
  | boolean
  | Record<string, AppearanceValue>;

interface IFrescoSdk {
  onReady(callback: () => void): void;
  onStateChanged(callback: () => void): void;
  subscribeToGlobalEvent(
    eventName: string,
    handler: (event: any) => void
  ): () => void;
  element: {
    state: any;
    id: string;
    name: string;
    appearance: Record<string, AppearanceValue>;
  };
  setState(state: any): void;
  initialize(defaultState: any, options: IInitializeOptions): void;
  send(action: { type: string; payload: any }): void;
  localParticipant: {
    id: string;
    isController: boolean;
  };
}

declare var fresco: IFrescoSdk;
