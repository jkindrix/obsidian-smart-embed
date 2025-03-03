import { Parser } from "../parsers/Parser";
import { FileParser } from "../parsers/FileParser";
import { PrefixParser } from "../parsers/PrefixParser";

/**
 * Factory class to select the appropriate parser based on input format.
 */
export class ParserFactory {
  /**
   * Determines and returns the correct parser for a given source.
   *
   * @param source - The input string that needs parsing.
   * @returns A parser instance capable of handling the input.
   * @throws Error if no suitable parser is found.
   */
  static getParser(source: string): Parser {
    if (!source || typeof source !== "string") {
      throw new Error("Invalid source: expected a non-empty string.");
    }

    const trimmedSource = source.trim();

    if (/\[\[[^\[\]]+?\]\]/.test(trimmedSource)) {
      return new FileParser();
    }

    if (/^\s*prefix:.+/.test(trimmedSource)) {
      return new PrefixParser();
    }

    throw new Error(`No suitable parser found for source: "${trimmedSource}"`);
  }
}
