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

type Participant = {
  name: string;
  id: string;
};

type ProtectedStorageItem = {
  ownerId: string;
  id: string;
  value: ProtectedStorageValueType;
};

type RealtimeValue =
  | Record<string, unknown>
  | string
  | boolean
  | undefined
  | null;

type RealtimeKeyValues = { [key: string]: RealtimeValue };

type RealtimeTables = {
  [tableName: string]: RealtimeKeyValues;
};

interface IFrescoSdk {
  onReady(callback: () => void): void;
  onStateChanged(callback: () => void): void;
  /*
   * Subscribe to a global event raised by the fresco space
   *
   * @param {string} eventName
   * @param {Function} callback
   */
  subscribeToGlobalEvent(
    eventName: string,
    handler: (event: any) => void
  ): () => void;
  element: {
    state: any;
    id: string;
    name: string;
    appearance: Record<string, AppearanceValue>;
    storage: {
      [tableName: string]: ProtectedStorageItem[];
    };
  };
  setState(state: any): void;
  initialize(defaultState: any, options: IInitializeOptions): void;
  send(action: { type: string; payload: any }): void;
  localParticipant: Participant & {
    identityId: string;
    isInsideElement: boolean;
  };
  remoteParticipants: Participant[];
  /*
   * Table array storage is expected to be persisted for the lifetime of an element unless cleared.
   * Table array storage has a latency of up to a few seconds.
   *
   * The structure is as follows:
   * ```
   * tableName: [
   *    { id: "id1", ownerId: "participant-id", value: "value1" },
   *    { id: "id2", ownerId: "participant-id", value: "value2" },
   * ]
   * ```
   */
  storage: {
    /*
     * Add an item to the table array.
     * A unique `id` will be generated.
     *
     * @param tableName The name of the table array
     * @param value The value to add
     */
    add: (tableName: string, value: AppearanceValue) => void;
    /*
     * Remove an item from the table array.
     *
     * @param tableName The name of the table array
     * @param id The id of the item to remove
     */
    remove: (tableName: string, id: string) => void;
    /*
     * Clear all keys and values from a table array
     *
     * @param tableName The name of the table array
     */
    clear: (tableName: string) => void;
    /*
     * Add an item, with a user supplied `id` to the table array.
     *
     * @param tableName The name of the table array
     * @param id The id of the item to add
     * @param value The value to add
     */
    set: (tableName: string, id: string, value: AppearanceValue) => void;
    /*
     * Get an item from the table array.
     *
     * @param tableName The name of the table array
     * @param id The id of the item to get
     * @returns The item with the given `id` or `null` if none exists
     */
    get: (tableName: string, id: string) => ProtectedStorageItem | null;
    /*
     * Realtime storage is expected to be persisted only while participants are connected to the space.
     * Updating realtime storage has sub-second latency.
     *
     * Realtime storage is of the following structure:
     * ```
     * tableName: {
     *   key1: value1,
     *   key2: value2,
     * }
     * ```
     */
    realtime: {
      /*
       * Set a value in a realtime table
       * @param tableName The name of the table
       * @param key The key inside the table
       * @parm value The value to store
       */
      set: (tableName: string, key: string, value: RealtimeValue) => void;
      /*
       * Get a value from a realtime table.
       * To remove an item, set a value of `undefined`
       *
       * @param tableName The name of the table
       * @param key The key inside the table
       * @returns The value stored at the given key or `null` if none exists
       */
      get: (tableName: string, key: string) => RealtimeValue;
      /*
       * Get all keys and values from a realtime table
       *
       * @param tableName The name of the table
       * @returns All keys and values in the table or `{}` if the table does not exist
       */
      all: (tableName: string) => RealtimeKeyValues;
      /*
       * Clear all keys and values from a realtime table
       *
       * @param tableName The name of the table
       */
      clear: (tableName: string) => void;
    };
  };
}

declare var fresco: IFrescoSdk;
