import { TFile } from "obsidian";
import { SortingStrategy } from "./SortingStrategy";

export class ModifiedSortingStrategy implements SortingStrategy {
  sort(files: TFile[]): TFile[] {
    return files.sort((a, b) => a.stat.mtime - b.stat.mtime);
  }
}
