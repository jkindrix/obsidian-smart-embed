import { Parser } from "../parsers/Parser";
import { EmbedRequest } from "../models/EmbedRequest";

export class PrefixParser implements Parser {
  parse(source: string): EmbedRequest[] {
    const prefixMatch = /^prefix:(.+)/.exec(source.trim());
    if (!prefixMatch) return []; // Ensure we return an array

    const request = new EmbedRequest();
    request.setPrefix(prefixMatch[1].trim());
    return [request];
  }
}
