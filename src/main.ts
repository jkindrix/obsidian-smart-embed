import { Plugin } from "obsidian";
import { FileService } from "./services/FileService.js";
import { EmbedManager } from "./services/EmbedManager.js";
import { ParserFactory } from "./parsers/ParserFactory.js";
import { ErrorHandler } from "./utils/ErrorHandler";

export default class SmartEmbed extends Plugin {
  static codeBlockKeyword = "smart-embed";
  private fileService!: FileService;
  private embedManager!: EmbedManager;

  async onload() {
    this.fileService = new FileService(this.app);
    this.embedManager = new EmbedManager(this.fileService);

    this.registerMarkdownCodeBlockProcessor(SmartEmbed.codeBlockKeyword, async (source, el, ctx) => {
      try {
        const parser = ParserFactory.getParser(source);
        const embedRequests = parser.parse(source); // Now correctly returns an array

        if (!Array.isArray(embedRequests) || embedRequests.length === 0) {
          ErrorHandler.display(el, "Invalid format. Use [[file]] [[file#section]] or prefix:prefix_name");
          return;
        }

        await this.embedManager.embed(embedRequests, el, ctx);
      } catch (error) {
        ErrorHandler.display(el, `Error processing embed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }
}
