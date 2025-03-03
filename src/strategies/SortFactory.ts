import { SortingStrategy } from "./SortingStrategy";
import { NameSortingStrategy } from "./NameSortingStrategy";
import { CreatedSortingStrategy } from "./CreatedSortingStrategy";
import { ModifiedSortingStrategy } from "./ModifiedSortingStrategy";
import { ReverseSortingStrategy } from "./ReverseSortingStrategy";

export class SortFactory {
  static getSortingStrategy(type: string): SortingStrategy {
    switch (type.toLowerCase()) {
      case "name":
        return new NameSortingStrategy();
      case "created":
        return new CreatedSortingStrategy();
      case "modified":
        return new ModifiedSortingStrategy();
      case "reverse":
        return new ReverseSortingStrategy();
      default:
        throw new Error(`Invalid sort option: '${type}'`);
    }
  }
}
