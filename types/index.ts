export interface ColorWithName {
    hex: string;
    name: string;
  }
  
  export interface SavedPalette {
    id: string;
    name: string;
    colors: ColorWithName[];  // Sada svaka boja ima hex i ime
    createdAt: Date;
  }