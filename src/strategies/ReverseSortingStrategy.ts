import { TFile } from "obsidian";
import { SortingStrategy } from "./SortingStrategy";

export class ReverseSortingStrategy implements SortingStrategy {
  sort(files: TFile[]): TFile[] {
    return files.reverse();
  }
}
