import { Parser } from "../parsers/Parser";
import { EmbedRequest } from "../models/EmbedRequest";

/**
 * Parses prefix-based embed requests.
 */
export class PrefixParser implements Parser {
  /**
   * Parses the given source text and extracts prefix-based embed requests.
   *
   * @param source - The input string containing prefix data.
   * @returns A readonly array of EmbedRequest objects.
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

    const prefixMatch = /^\s*prefix:\s*(.+)/.exec(filteredSource.trim());
    if (!prefixMatch) return [];

    const prefixValue = prefixMatch[1]?.trim();
    if (!prefixValue) {
      console.warn("Skipping empty prefix request:", source);
      return [];
    }

    try {
      const request = new EmbedRequest();
      request.setPrefix(prefixValue);
      return [request];
    } catch (error) {
      console.error(`Error creating EmbedRequest for prefix: "${prefixValue}"`, error);
      return [];
    }
  }
}
