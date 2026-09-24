export interface TableViewModel {
  columns: ColumnViewModel[];
}

export interface ColumnViewModel {
  header: string;
  values: string[];
  annotation?: ColumnAnnotationViewModel;
}

interface ColumnAnnotationViewModel {
  icon: string;
  label: string;
}
