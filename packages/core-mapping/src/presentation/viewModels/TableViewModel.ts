export interface TableViewModel {
  columns: ColumnViewModel[];
}

interface ColumnViewModel {
  header: string;
  values: string[];
  annotation?: ColumnAnnotationViewModel;
}

interface ColumnAnnotationViewModel {
  icon: string;
  label: string;
}
