import * as path from "path";
import * as fs from "fs";

// Search for the project root directory that contains a .env file.
const findRootEnv = (searchPath: string): string => {
  // If the search path has reached the file system root ("/")
  // and no .env file was found, throw error
  if (searchPath === "/") {
    throw new Error(".env file doesn't exist");
  }

  // Check if the directory searchPath contains a .env file
  // If a file named ".env" exists here, return the current path.
  if (fs.readdirSync(searchPath).find((file) => file === ".env")) {
    return searchPath;
  }

  // If .env was not found, move one directory up and continue searching.
  return findRootEnv(path.join(searchPath, "../"));
};

export const projectRootPath = findRootEnv(__dirname); // Define the project's root path by finding the directory containing the .env file.
export const projectEnvPath = path.join(projectRootPath, ".env");
export const lambdasDirPath = path.join(projectRootPath, "packages/lambdas");
export const lambdaLayersDirPath = path.join(
  projectRootPath,
  "packages/lambda-layers"
);
export const frontendDistPath = path.join(
  projectRootPath,
  "apps/frontend/dist"
);
console.log({ projectRootPath });
