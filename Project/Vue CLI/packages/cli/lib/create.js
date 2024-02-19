const path = require("path");
const getPromptModules = require("./utils/createTools");
const Creator = require("./Creator.js");

async function create(appName) {
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, appName);

  console.log(targetDir);

  const creator = new Creator(targetDir, appName, getPromptModules());
  await creator.create();
}

module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log(err);
  });
};
