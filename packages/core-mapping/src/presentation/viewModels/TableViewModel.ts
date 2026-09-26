export interface TableViewModel {
  columns: ColumnViewModel[];
}

export interface ColumnViewModel {
  header: string;
  values: string[];
}
