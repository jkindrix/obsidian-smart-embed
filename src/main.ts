import { Plugin } from "obsidian";
import { FileService } from "./services/FileService.js";
import { EmbedManager } from "./services/EmbedManager.js";
import { ParserFactory } from "./parsers/ParserFactory.js";
import { ErrorHandler } from "./utils/ErrorHandler";

export default class SmartEmbed extends Plugin {
  static codeBlockKeyword = "embed";
  private fileService!: FileService;
  private embedManager!: EmbedManager;

  async onload() {
    this.fileService = new FileService(this.app);
    this.embedManager = new EmbedManager(this.fileService);

    this.registerMarkdownCodeBlockProcessor(SmartEmbed.codeBlockKeyword, async (source, el, ctx) => {
      try {
        // Filter out commented lines
        const uncommentedSource = this.filterComments(source);

        // Ensure there's content to process
        if (!uncommentedSource.trim()) {
          ErrorHandler.display(el, "No valid embed requests after filtering comments.");
          return;
        }

        // Use the parser to extract embed requests
        const parser = ParserFactory.getParser(uncommentedSource);
        const embedRequests = parser.parse(uncommentedSource);

        if (!Array.isArray(embedRequests) || embedRequests.length === 0) {
          ErrorHandler.display(el, "Invalid format. Use [[file]], [[file#section]], or prefix:prefix_name");
          return;
        }

        await this.embedManager.embed(embedRequests, el, ctx);
      } catch (error) {
        ErrorHandler.display(el, `Error processing embed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }

  /**
   * Filters out commented lines from the source text.
   * Comments can start with `#` or `//` at the beginning of a line.
   */
  private filterComments(source: string): string {
    return source
      .split("\n")
      .filter(line => !line.trim().startsWith("#") && !line.trim().startsWith("//"))
      .join("\n");
  }
}
