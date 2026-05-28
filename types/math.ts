import { z } from "zod";

// Mirrors Math.Application.Dtos

export const ConversionResultDtoSchema = z.object({
  from: z.string(),
  to: z.string(),
  inputValue: z.number(),
  outputValue: z.number(),
  category: z.string(),
});

export const UnitCategoryDtoSchema = z.object({
  category: z.string(),
  units: z.array(z.string()),
});
export type UnitCategoryDto = z.infer<typeof UnitCategoryDtoSchema>;
