export class ErrorHandler {
  static display(parent: HTMLElement, message: string) {
    parent.createEl("pre", {
      text: `Smart Embed: Error: ${message}`,
      cls: ["smart-embed", "smart-embed-error"]
    });
  }
}
