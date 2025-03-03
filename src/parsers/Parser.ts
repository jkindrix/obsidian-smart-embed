import { EmbedRequest } from "../models/EmbedRequest";

/**
 * Interface for parsing source text and extracting embed requests.
 */
export interface Parser {
  /**
   * Parses the given source text and extracts embed requests.
   *
   * @param source - The input string containing Obsidian-style links.
   * @returns A readonly array of structured EmbedRequest objects.
   */
  parse(source: string): ReadonlyArray<EmbedRequest>;
}
