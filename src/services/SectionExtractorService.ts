import { Logger } from "../utils/Logger";

export class SectionExtractorService {
  static extractSection(
    content: string,
    section: string,
    includeHeader: boolean = true,
    occurrence: number = 1
  ): string | null {
    Logger.log("Looking for section:", section, `Include Header: ${includeHeader}`);

    // Normalize line endings to Unix format for consistency
    content = content.replace(/\r\n/g, "\n");

    // Decode HTML entities to handle embedded special characters
    content = SectionExtractorService.decodeHtmlEntities(content);

    // Normalize section names for flexible matching
    const normalizeSection = (section: string): string =>
      section
        .normalize("NFKC") // Normalize Unicode representations
        .replace(/[*_~`[\]]/g, "") // Remove markdown formatting symbols
        .replace(/\s{2,}/g, " ") // Normalize spaces but keep numbers in section titles
        .trim();

    const escapedSection = normalizeSection(section).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    // Adjusted regex to match section headers (handles bolded titles and leading numbers)
    const sectionRegex = new RegExp(`(^|\\n)(#{1,6})\\s*(\\*\\*)?${escapedSection}(\\*\\*)?\\s*(\\n|$)`, "i");

    let inCodeBlock = false;
    let matchIndex = -1;
    let matchCount = 0;
    let matchedHeaderLevel = 0;
    let lines = content.split("\n");

    Logger.log("Looking for section:", escapedSection);

    // Identify the correct section occurrence while avoiding code blocks
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Detect the start/end of fenced code blocks
      if (line.startsWith("```") && !line.includes(section)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip if inside a code block (but allow if it explicitly contains the section)
      if (inCodeBlock) continue;

      // Check for section match
      const regexMatch = line.match(sectionRegex);
      if (regexMatch) {
        Logger.log(`Found section match: '${regexMatch[0]}'`);
        matchCount++;
        if (matchCount === occurrence) {
          matchIndex = i;
          matchedHeaderLevel = regexMatch[2].length; // Capture header level (number of #)
          break;
        }
      }
    }

    if (matchIndex === -1) {
      Logger.warn(`Section '${section}' NOT found in content`);
      return "**Error:** Section not found.";
    }

    // Locate the start index in the original content
    let startIndex = matchIndex;
    if (!includeHeader) {
      startIndex += 1; // Skip the section header line
    }

    // Find the next same-level or higher header to determine the end boundary
    let endIndex = content.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      let line = lines[i].trim();
      const nextHeaderMatch = line.match(new RegExp(`^(#{1,${matchedHeaderLevel}})\\s+`));

      if (nextHeaderMatch) {
        endIndex = i;
        break;
      }
    }

    // Extract content within the determined boundaries
    let extractedContent = lines.slice(startIndex, endIndex).join("\n").trim();

    Logger.log("Extracted Content:", extractedContent);

    return extractedContent.length > 0 ? extractedContent : "**Error:** Section is empty.";
  }

  // Function to decode HTML entities to handle embedded special characters
  private static decodeHtmlEntities(text: string): string {
    return text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
