import { Parser } from "../parsers/Parser";
import { EmbedRequest } from "../models/EmbedRequest";

/**
 * Parses Obsidian-style file embed links.
 */
export class FileParser implements Parser {
  /**
   * Parses the given source text and extracts file embed requests.
   *
   * @param source - The input text containing file references.
   * @returns A readonly array of structured EmbedRequest objects.
   */
  parse(source: string): ReadonlyArray<EmbedRequest> {
    if (!source || typeof source !== "string") {
      console.error("Invalid input: source must be a non-empty string.");
      return [];
    }

    // Filter out commented lines (lines starting with # or //)
    const filteredSource = source
      .split("\n")
      .filter(line => !line.trim().startsWith("#") && !line.trim().startsWith("//"))
      .join("\n");

    const filePattern =
      /\[\[(?<file>[^\[\]#]+)(?:#(?<section>[^\[\]!]+))?(?<include>!?)\]\]/g;

    const matches = [...filteredSource.matchAll(filePattern)];
    if (matches.length === 0) return [];

    return matches
      .map((match) => this.extractEmbedRequest(match))
      .filter((req): req is EmbedRequest => req !== null);
  }

  /**
   * Extracts an EmbedRequest from a regex match.
   *
   * @param match - A single regex match object.
   * @returns An EmbedRequest or null if invalid.
   */
  private extractEmbedRequest(match: RegExpMatchArray): EmbedRequest | null {
    if (!match.groups) {
      console.warn("Skipping malformed file link:", match[0]);
      return null;
    }

    const fileName = match.groups.file?.trim();
    const section = match.groups.section?.trim() || undefined;
    const includeHeader = match.groups.include !== "!";

    if (!fileName) {
      console.warn(`Invalid file link detected: ${match[0]}`);
      return null;
    }

    try {
      const request = new EmbedRequest();
      request.addFile(fileName, section, includeHeader);
      return request;
    } catch (error) {
      console.error(`Error creating EmbedRequest for ${fileName}:`, error);
      return null;
    }
  }
}
