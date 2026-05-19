import { api } from "@/lib/api-client";
import type { ConversionResultDto, UnitCategoryDto } from "@/types/math";

export const fetchConversion = (from: string, to: string, value: number) =>
  api.get<ConversionResultDto>(
    `/api/math/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&value=${value}`
  );

export const fetchUnits = () =>
  api.get<UnitCategoryDto[]>("/api/math/convert/units");
