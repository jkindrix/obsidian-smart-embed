import { Plugin, MarkdownRenderer, App, Component } from "obsidian";

export class MarkdownRendererService {
  static async render(app: App, content: string, container: HTMLElement, ctx: any, plugin: Plugin) {
    const component = new Component(); // Create a Component instance
    try {
      await MarkdownRenderer.render(app, content, container, ctx.sourcePath, component);
    } finally {
      component.load(); // Ensures the component is correctly managed
    }
  }
}
