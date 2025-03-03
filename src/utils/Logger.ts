export class Logger {
  static debugMode = false;

  static log(...args: any[]) {
    if (this.debugMode) console.log("[SmartEmbed]", ...args);
  }

  static warn(...args: any[]) {
    if (this.debugMode) console.warn("[SmartEmbed]", ...args);
  }

  static error(...args: any[]) {
    console.error("[SmartEmbed]", ...args); // Always log errors
  }
}
