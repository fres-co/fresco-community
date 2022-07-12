import { updateHost, reducer } from "./hostSlice";
import { IS_MOUNTED_TABLE } from "./persistIsMounted";
import * as mounted from "./persistIsMounted";
import { mockSdk } from "../../mocks";

describe("hostSlice", () => {
  describe("updateHost", () => {
    it("should persist isMounted if not persisted", () => {
      mockSdk(undefined, {
        [IS_MOUNTED_TABLE]: {},
      });
      const spy = jest.spyOn(mounted, "persistIsMounted");
      reducer(
        { currentHost: null, isMounted: true, frescoUpdateCount: 0 },
        updateHost()
      );
      expect(spy).toBeCalled();
    });
  });
});
