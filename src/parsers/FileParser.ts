import { Parser } from "../parsers/Parser";
import { EmbedRequest } from "../models/EmbedRequest";

export class FileParser implements Parser {
  parse(source: string): EmbedRequest[] {
    const filePattern = /\[\[([^\[\]]+?)(?:#(.+?))?(!?)\]\]/g;
    const matches = [...source.matchAll(filePattern)];

    if (matches.length === 0) return []; // Ensure we return an array

    return matches.map(match => {
      const request = new EmbedRequest();
      const fileName = match[1].trim();
      let section = match[2]?.trim() ?? null;
      const includeHeader = match[3] !== "!"; // `!` means exclude the header

      request.addFile(fileName, section, includeHeader);
      return request;
    });
  }
}
