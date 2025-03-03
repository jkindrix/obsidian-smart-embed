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
    return await this.app.vault.cachedRead(file);
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
