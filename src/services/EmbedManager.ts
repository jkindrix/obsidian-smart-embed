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

      // Create a wrapper container with relative positioning
      const wrapper = el.createDiv({ cls: ["smart-embed-wrapper"] });
      wrapper.style.position = "relative";

      // Create a div for content rendering
      const container = wrapper.createDiv({ cls: ["smart-embed"] });

      // Create a copy button with an SVG clipboard icon
      const copyButton = document.createElement("button");
      copyButton.classList.add("smart-embed-copy-button");
      copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3H16V5H20V21H4V5H8V3ZM6 19H18V7H6V19ZM10 3V5H14V3H10Z"></path>
        </svg>
      `;

      // Position the button in the top-right corner
      copyButton.style.position = "absolute";
      copyButton.style.top = "5px";
      copyButton.style.right = "5px";

      // Copy the final embedded content
      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(combinedContent.trim()).then(() => {
          copyButton.innerHTML = "✔️";
          setTimeout(() => {
            copyButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H16V5H20V21H4V5H8V3ZM6 19H18V7H6V19ZM10 3V5H14V3H10Z"></path>
              </svg>
            `;
          }, 1500);
        }).catch(err => console.error("Copy failed:", err));
      });

      wrapper.appendChild(copyButton);
      wrapper.appendChild(container);
      el.appendChild(wrapper);

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
