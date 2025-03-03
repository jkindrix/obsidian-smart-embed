import { TFile, App } from "obsidian";

export class FileService {
  private app: App;
  constructor(app: App) {
    this.app = app;
  }

  getFileByName(fileName: string): TFile | null {
    return this.app.metadataCache.getFirstLinkpathDest(fileName, "");
  }

  async readFile(file: TFile): Promise<string> {
    let content = await this.app.vault.cachedRead(file);

    // Check if content starts with YAML front matter
    if (content.startsWith("---")) {
      const yamlEndIndex = content.indexOf("\n---", 3); // Locate the closing `---`
      if (yamlEndIndex !== -1) {
        content = content.slice(yamlEndIndex + 4).trim(); // Remove YAML and leading whitespace
      }
    }

    return content;
  }

  getFilesByPrefix(prefix: string): TFile[] {
    if (!prefix.trim()) {
      throw new Error("Prefix cannot be empty.");
    }
    return this.app.vault.getFiles().filter(file =>
      file.name.startsWith(prefix) && file.extension === "md"
    );
  }
}
