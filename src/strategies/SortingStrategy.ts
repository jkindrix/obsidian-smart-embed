import { TFile } from "obsidian";

export interface SortingStrategy {
  sort(files: TFile[]): TFile[];
}
