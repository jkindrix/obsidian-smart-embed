import { EmbedRequest } from "../models/EmbedRequest";

export interface Parser {
  parse(source: string): EmbedRequest[];
}
