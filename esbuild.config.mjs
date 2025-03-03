import esbuild from "esbuild";
import { builtinModules } from "module";

const IS_PRODUCTION = process.argv.includes("production");

const ENTRY_FILE = "src/main.ts";
const OUTPUT_FILE = "main.js";

const BUILD_BANNER = `/*
 * Bundled with esbuild
 * For source code, visit: https://github.com/jkindrix/obsidian-smart-embed
 */
`;

const externalDependencies = [
	"obsidian",
	"electron",
	...builtinModules,
	"@codemirror/autocomplete",
	"@codemirror/closebrackets",
	"@codemirror/collab",
	"@codemirror/commands",
	"@codemirror/comment",
	"@codemirror/fold",
	"@codemirror/gutter",
	"@codemirror/highlight",
	"@codemirror/history",
	"@codemirror/language",
	"@codemirror/lint",
	"@codemirror/matchbrackets",
	"@codemirror/panel",
	"@codemirror/rangeset",
	"@codemirror/rectangular-selection",
	"@codemirror/search",
	"@codemirror/state",
	"@codemirror/stream-parser",
	"@codemirror/text",
	"@codemirror/tooltip",
	"@codemirror/view",
];

const buildOptions = {
	entryPoints: [ENTRY_FILE],
	outfile: OUTPUT_FILE,
	bundle: true,
	external: externalDependencies,
	format: "cjs",
	target: "ESNext",
	sourcemap: IS_PRODUCTION ? false : "inline",
	treeShaking: true,
	banner: { js: BUILD_BANNER },
	logLevel: "info",
};

async function build() {
	try {
		await esbuild.build(buildOptions);
		console.log(`Build successful! Output: ${OUTPUT_FILE}`);
	} catch (error) {
		console.error("Build failed:", error.message);
		process.exit(1);
	}
}

build();
