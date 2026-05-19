// Mirrors Math.Application.Dtos

export interface ConversionResultDto {
  from: string;
  to: string;
  inputValue: number;
  outputValue: number;
  category: string;
}

export interface UnitCategoryDto {
  category: string;
  units: string[];
}
