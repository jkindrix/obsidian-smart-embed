import { TFile } from "obsidian";
import { SortingStrategy } from "./SortingStrategy";

export class CreatedSortingStrategy implements SortingStrategy {
  sort(files: TFile[]): TFile[] {
    return files.sort((a, b) => a.stat.ctime - b.stat.ctime);
  }
}
