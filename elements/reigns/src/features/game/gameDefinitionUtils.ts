import { urlWithoutTrailingSlash } from "./validateGameDefinition";

export const getRootAssetsUrl = (url: string) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  ) {
    return urlWithoutTrailingSlash(url);
  }

  const isFolder = document.location.pathname.slice(-1) === "/";
  if (isFolder) {
    return urlWithoutTrailingSlash(
      `${urlWithoutTrailingSlash(document.location.pathname)}/${url}`
    );
  }

  const [_path, ...reversedFolders] = document.location.pathname
    .split("/")
    .reverse();

  return urlWithoutTrailingSlash(
    `${reversedFolders.reverse().join("/")}/${url}`
  );
};
