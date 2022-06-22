import { getRootAssetsUrl } from "./gameDefinitionUtils";

describe("gameDefinitionUtils", () => {
  describe("getRootAssetsUrl", () => {
    it("returns a default empty string", () => {
      const foo = null as unknown as string;
      expect(getRootAssetsUrl(foo)).toBe("");
    });

    it("keep a default https url ", () => {
      expect(getRootAssetsUrl("https://foo.fr/mar/fi")).toBe(
        "https://foo.fr/mar/fi"
      );
    });

    it("remove a trailing slash for an https url ", () => {
      expect(getRootAssetsUrl("https://foo.fr/mar/fi/knine/")).toBe(
        "https://foo.fr/mar/fi/knine"
      );
    });

    it("uses the location pathname to prefix non http url", () => {
      global.document = {
        location: {
          pathname: "/",
        },
      } as any;
      expect(getRootAssetsUrl("foo")).toBe("/foo");
    });

    it("when pathaname is a file, uses the current pathname folder to prefix non http url", () => {
      global.document = {
        location: {
          pathname: "/foo/bar/baz",
        },
      } as any;
      expect(getRootAssetsUrl("qux")).toBe("/foo/bar/qux");
    });

    it("when pathname is a folder, uses the location pathname to prefix non http url", () => {
      global.document = {
        location: {
          pathname: "/foo/bar/baz/",
        },
      } as any;
      expect(getRootAssetsUrl("qux")).toBe("/foo/bar/baz/qux");
    });

    it("remove trailing slash from provided url", () => {
      global.document = {
        location: {
          pathname: "/foo/e",
        },
      } as any;
      expect(getRootAssetsUrl("quzz/")).toBe("/foo/quzz");
    });
  });
});
