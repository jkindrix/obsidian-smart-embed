export class EmbedRequest {
  fileName?: string;
  section?: string;
  prefix?: string;
  includeHeader: boolean = true; // Default: include header

  addFile(fileName: string, section?: string, includeHeader: boolean = true) {
    this.fileName = fileName;
    this.section = section;
    this.includeHeader = includeHeader;
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  isFileEmbed(): boolean {
    return !!this.fileName;
  }

  isPrefixEmbed(): boolean {
    return !!this.prefix;
  }

  isValid(): boolean {
    return this.isFileEmbed() || this.isPrefixEmbed();
  }
}
