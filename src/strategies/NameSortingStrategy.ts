import { TFile } from "obsidian";
import { SortingStrategy } from "./SortingStrategy";

export class NameSortingStrategy implements SortingStrategy {
  sort(files: TFile[]): TFile[] {
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }
}
