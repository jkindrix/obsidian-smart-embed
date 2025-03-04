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

      // Copy the fully resolved embedded content
      copyButton.addEventListener("click", async () => {
        const fullyResolvedContent = await this.resolveNestedEmbeds(combinedContent.trim());

        navigator.clipboard.writeText(fullyResolvedContent).then(() => {
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
    let content = "";

    if (embedRequest.isFileEmbed()) {
      content = await this.embedFile(embedRequest.fileName!, embedRequest.section, embedRequest.includeHeader);
    } else if (embedRequest.isPrefixEmbed()) {
      content = await this.embedFilesByPrefix(embedRequest.prefix!);
    }

    // Only resolve nested embeds **inside** an `embed` code block
    return embedRequest.isFileEmbed() || embedRequest.isPrefixEmbed()
      ? await this.resolveNestedEmbeds(content)
      : content;
  }

  /**
   * Resolves **only** embedded documents inside `embed` code fences.
   */
  private async resolveNestedEmbeds(content: string): Promise<string> {
    const embedCodeBlockPattern = /^```embed\n([\s\S]*?)\n```$/gm; // Match `embed` code blocks

    let matches = [...content.matchAll(embedCodeBlockPattern)];
    if (matches.length === 0) return content;

    let resolvedContent = content;

    for (const match of matches) {
      const embedText = match[1]; // Extract the text inside ```embed```
      const resolvedEmbed = await this.parseAndResolveEmbeds(embedText);

      // Replace the entire matched embed block with the resolved content
      resolvedContent = resolvedContent.replace(match[0], resolvedEmbed);
    }

    return resolvedContent;
  }

  /**
   * Extracts and resolves **only `embed`-style wikilinks** inside embed code blocks.
   */
  private async parseAndResolveEmbeds(embedText: string): Promise<string> {
    const embedPattern = /\[\[(?<file>[^\[\]#]+)(?:#(?<section>[^\[\]!]+))?(?<include>!?)\]\]/g;

    let content = embedText;
    let match;

    while ((match = embedPattern.exec(embedText)) !== null) {
      const fileName = match.groups?.file?.trim();
      const section = match.groups?.section?.trim();
      const includeHeader = match.groups?.include !== "!";

      if (!fileName) continue;

      // Fetch the embedded document's content
      const embedRequest = new EmbedRequest();
      embedRequest.addFile(fileName, section, includeHeader);
      const embeddedContent = await this.fetchContent(embedRequest);

      // Replace the embed reference **only inside the `embed` code fence**
      content = content.replace(match[0], embeddedContent);
    }

    return content;
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
