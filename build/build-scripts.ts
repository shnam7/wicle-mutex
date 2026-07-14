import dts from "bun-plugin-dtsx";

const entries = ["./src/index.ts"];
const outdir = "./dist";

const baseOptions = {
  entrypoints: entries,
  outdir,
  target: "node",
  //   minify: true,
} satisfies Partial<Bun.BuildConfig>;

const esmOptions = {
  format: "esm",
  naming: { entry: "[name].js" },
  plugins: [dts()],
} satisfies Partial<Bun.BuildConfig>;

const cjsOptions = {
  format: "cjs",
  naming: { entry: "[name].cjs" },
} satisfies Partial<Bun.BuildConfig>;

//--- build the ESM and CJS versions of the library
await Bun.build({ ...baseOptions, ...esmOptions });
console.log("esm build completed,");

await Bun.build({ ...baseOptions, ...cjsOptions });
console.log("cjs build completed,");
