import { Plugin, TFile } from "obsidian";
import { FileService } from "./services/FileService";
import { MarkdownRendererService } from "./services/MarkdownRendererService";
import { ErrorHandler } from "./utils/ErrorHandler";
import { SortFactory } from "./strategies/SortFactory";
import { SectionExtractorService } from "./services/SectionExtractorService";

export default class SmartEmbed extends Plugin {
  static codeBlockKeyword = "smart-embed";

  private fileService!: FileService;

  async onload() {
    this.fileService = new FileService(this.app);

    this.registerMarkdownCodeBlockProcessor(SmartEmbed.codeBlockKeyword, async (source, el, ctx) => {
      const filePattern = /\[\[([^\[\]]+?)(?:#(.+?))?\]\]/u;
      const prefixPattern = /^prefix:(.+)/;

      const fileMatch = filePattern.exec(source);
      const prefixMatch = prefixPattern.exec(source.trim());

      if (fileMatch) {
        const fileName = fileMatch[1];
        const section = fileMatch[2] ?? ""; // Ensure section is a string
        await this.embedFile(fileName, section, el, ctx);
      } else if (prefixMatch) {
        await this.embedFilesByPrefix(prefixMatch[1].trim(), el, ctx);
      } else {
        ErrorHandler.display(el, "Invalid format. Use [[file]] or [[file#section]] or prefix:prefix_name");
      }
    });
  }

  async embedFile(fileName: string, section: string, el: HTMLElement, ctx: any) {
    try {
      const file = this.fileService.getFileByName(fileName);
      if (!file) {
        ErrorHandler.display(el, `File '${fileName}' not found`);
        return;
      }
      if (file.extension !== "md") {
        ErrorHandler.display(el, `Invalid file extension for '${fileName}', expected markdown`);
        return;
      }

      let content = await this.fileService.readFile(file);
      if (section) {
        content = SectionExtractorService.extractSection(content, section) ?? "";
        if (!content) {
          ErrorHandler.display(el, `Section '${section}' not found in '${fileName}'`);
          return;
        }
      }

      const container = el.createDiv({ cls: ["dynamic-embed"] });
      await MarkdownRendererService.render(this.app, content, container, ctx, this);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      ErrorHandler.display(el, `Unexpected error: ${errorMessage}`);
    }
  }

  async embedFilesByPrefix(prefix: string, el: HTMLElement, ctx: any) {
    try {
      const files = this.fileService.getFilesByPrefix(prefix);
      if (files.length === 0) {
        ErrorHandler.display(el, `No markdown files found with prefix '${prefix}'`);
        return;
      }

      let combinedContent = "";
      for (const file of files) {
        const content = await this.fileService.readFile(file);
        combinedContent += `# ${file.name}\n\n${content}\n\n---\n\n`;
      }

      const container = el.createDiv({ cls: ["smart-embed"] });
      await MarkdownRendererService.render(this.app, combinedContent, container, ctx, this);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      ErrorHandler.display(el, `Unexpected error: ${errorMessage}`);
    }
  }
}
