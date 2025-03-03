import { FileService } from "../services/FileService";
import { EmbedRequest } from "../models/EmbedRequest";
import { ErrorHandler } from "../utils/ErrorHandler";
import { MarkdownRendererService } from "../services/MarkdownRendererService";
import { SectionExtractorService } from "../services/SectionExtractorService";

export class EmbedManager {
  private fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  async embed(embedRequests: EmbedRequest[], el: HTMLElement, ctx: any) {
    try {
      let combinedContent = "";

      for (const embedRequest of embedRequests) {
        const content = await this.fetchContent(embedRequest);
        if (!content) {
          combinedContent += `\n\n**Error:** No content found for '${embedRequest.fileName}'.\n\n`;
          continue;
        }
        combinedContent += `\n\n${content}\n\n---\n\n`;
      }

      if (!combinedContent.trim()) {
        ErrorHandler.display(el, "No valid content found.");
        return;
      }

      const container = el.createDiv({ cls: ["smart-embed"] });

      // Create a copy button
      const copyButton = container.createEl("button", { text: "Copy" });
      copyButton.classList.add("smart-embed-copy-button");

      // Copy the final embedded content
      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(combinedContent.trim()).then(() => {
          copyButton.textContent = "Copied!";
          setTimeout(() => (copyButton.textContent = "Copy"), 1500);
        }).catch(err => console.error("Copy failed:", err));
      });

      container.appendChild(copyButton); // Append button before rendering content

      // Render the markdown content
      await MarkdownRendererService.render(ctx.app, combinedContent, container, ctx, ctx.plugin);
    } catch (error) {
      ErrorHandler.display(el, `Embedding error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async fetchContent(embedRequest: EmbedRequest): Promise<string> {
    if (embedRequest.isFileEmbed()) {
      return await this.embedFile(embedRequest.fileName!, embedRequest.section, embedRequest.includeHeader);
    } else if (embedRequest.isPrefixEmbed()) {
      return await this.embedFilesByPrefix(embedRequest.prefix!);
    }
    return "";
  }

  private async embedFile(fileName: string, section?: string, includeHeader: boolean = true): Promise<string> {
    const file = this.fileService.getFileByName(fileName);
    if (!file) return `**Error:** File '${fileName}' not found.`;
    if (file.extension !== "md") return `**Error:** Invalid file type for '${fileName}', expected Markdown.`;

    let content = await this.fileService.readFile(file);
    if (section) {
      content = SectionExtractorService.extractSection(content, section, includeHeader) ?? `**Error:** Section '${section}' not found.`;
    }
    return content;
  }

  private async embedFilesByPrefix(prefix: string): Promise<string> {
    const files = this.fileService.getFilesByPrefix(prefix);
    if (files.length === 0) return `**Error:** No markdown files found with prefix '${prefix}'.`;

    let combinedContent = "";
    for (const file of files) {
      combinedContent += `\n\n${await this.fileService.readFile(file)}\n\n---\n\n`;
    }
    return combinedContent;
  }
}
