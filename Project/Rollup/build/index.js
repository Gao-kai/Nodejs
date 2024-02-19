import { rollup } from "rollup";
/**
 * @type {import('rollup').InputOptions}
 */
const inputOptions = {
  input: "src/main.js",
};

const outputOptionsList = [
  {
    dir: "dist",
    entryFileNames: "[name]-[hash]-[format].js",
    // file: "[name]-[hash]-[format][extname]",
    format: "umd",
    // sourcemap: true,
  },
  {
    dir: "dist",
    entryFileNames: "[name]-[hash]-[format].js",
    format: "cjs",
    // sourcemap: true,
  },
  {
    dir: "dist",
    entryFileNames: "[name]-[hash]-[format].js",
    format: "esm",
    // sourcemap: true,
  },
];

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    bundle = await rollup(inputOptions);
    console.log({ bundle });
    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }

  if (bundle) {
    await bundle.close();
  }
}

async function generateOutputs(bundle) {
  for (const option of outputOptionsList) {
    // const result = await bundle.generate(option);
    // const { output } = result;
    // for (const chunkOrAsset of output) {
    //   console.log({
    //     type: chunkOrAsset.type,
    //     code: chunkOrAsset.code,
    //     fileName: chunkOrAsset.fileName,
    //   });
    // }

    await bundle.write(option);
  }
}
build();
