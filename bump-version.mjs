import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

const targetVersion = process.env.npm_package_version;

if (!targetVersion) {
    console.error("Error: No version provided. Run `npm version <new-version>` first.");
    process.exit(1);
}

// Check for uncommitted changes
const gitStatus = execSync("git status --porcelain").toString().trim();
if (gitStatus) {
    console.error("Error: You have uncommitted changes. Commit or stash them before running this script.");
    process.exit(1);
}

// Check for staged but uncommitted changes
try {
    execSync("git diff --cached --quiet");
} catch {
    console.error("Error: You have staged changes. Please commit them manually before running this script.");
    process.exit(1);
}

// Ensure required JSON files exist, or initialize them
if (!existsSync("versions.json")) {
    console.warn("Warning: `versions.json` not found. Creating a new one.");
    writeFileSync("versions.json", "{}");
}

if (!existsSync("changelog.json")) {
    console.warn("Warning: `changelog.json` not found. Creating a new one.");
    writeFileSync("changelog.json", "{}");
}

// Update manifest.json
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
console.log(`Updated manifest.json → version: ${targetVersion}`);

// Update versions.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = {
    minAppVersion,
    releasedAt: new Date().toISOString()
};
writeFileSync("versions.json", JSON.stringify(versions, null, 2));
console.log(`Updated versions.json → Added entry for ${targetVersion}`);

// Update package.json
let packageJson = JSON.parse(readFileSync("package.json", "utf8"));
packageJson.version = targetVersion;
writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
console.log(`Updated package.json → version: ${targetVersion}`);

// Fetch recent commit messages for automatic changelog entry
const latestCommits = execSync("git log -5 --pretty=format:'- %s'").toString();
let changelog = JSON.parse(readFileSync("changelog.json", "utf8"));
changelog[targetVersion] = {
    changes: latestCommits || "No commit messages found.",
    releasedAt: new Date().toISOString()
};
writeFileSync("changelog.json", JSON.stringify(changelog, null, 2));
console.log(`Updated changelog.json → Logged changes for ${targetVersion}`);

// Prompt user for commit confirmation
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("Do you want to commit and push the changes? (y/N): ", (answer) => {
    readline.close();
    if (answer.toLowerCase() !== "y") {
        console.log("Aborting commit and push.");
        process.exit(0);
    }

    // Commit & tag the new version
    execSync(`git add manifest.json versions.json changelog.json package.json`);
    execSync(`git commit -m "[Smart Embed] Release v${targetVersion}"`);
    execSync(`git tag v${targetVersion}`);
    execSync(`git push && git push --tags`);

    console.log(`Successfully bumped version to v${targetVersion} and pushed changes.`);
});
