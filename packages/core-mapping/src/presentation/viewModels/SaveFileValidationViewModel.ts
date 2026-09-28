export interface SaveValidationMessageViewModel {
  message: string;
  location: string | null;
}

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
