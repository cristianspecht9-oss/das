
export interface ImageState {
  original: string | null;
  cartoon: string | null; // Keep name for compatibility or rename to 'processed'
  isLoading: boolean;
  error: string | null;
}

export enum ColoringStyle {
  BOLD = 'Dicke Linien',
  DETAILED = 'Detailreich',
  SKETCH = 'Bleistift-Skizze',
  MINIMAL = 'Minimalistisch'
}
