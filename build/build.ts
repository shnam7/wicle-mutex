import dts from "bun-plugin-dtsx";

const entries = ["./src/index.ts"];
const outdir = "./dist";

await Bun.build({
  entrypoints: entries,
  outdir,
  format: "esm",
  //   minify: true,
  naming: { entry: "[name].js" },
  plugins: [dts()],
});
console.log("esm build completed,");

// await Bun.build({ entrypoints: [entry], outdir, format: "cjs", naming: { entry: "[name].cjs" } });
// console.log("cjs build completed,");
