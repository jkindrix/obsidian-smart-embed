import { Plugin, MarkdownRenderer, App } from "obsidian";

export class MarkdownRendererService {
  static async render(app: App, content: string, container: HTMLElement, ctx: any, plugin: Plugin) {
    await MarkdownRenderer.render(app, content, container, ctx.sourcePath, plugin);
  }
}
