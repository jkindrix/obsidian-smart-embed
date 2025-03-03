import { Parser } from "../parsers/Parser";
import { FileParser } from "../parsers/FileParser";
import { PrefixParser } from "../parsers/PrefixParser";

export class ParserFactory {
  static getParser(source: string): Parser {
    if (/\[\[.*?\]\]/.test(source)) {
      return new FileParser();
    } else if (/^prefix:.+/.test(source)) {
      return new PrefixParser();
    }
    throw new Error("No suitable parser found for the given source.");
  }
}
