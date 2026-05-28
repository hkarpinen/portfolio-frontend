import { z } from "zod";
import { api } from "@/lib/api-client";
import { ConversionResultDtoSchema, UnitCategoryDtoSchema } from "@/types/math";

export const fetchConversion = (from: string, to: string, value: number) =>
  api.parsed.get(
    `/api/math/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&value=${value}`,
    ConversionResultDtoSchema,
  );

export const fetchUnits = () =>
  api.parsed.get("/api/math/convert/units", z.array(UnitCategoryDtoSchema));
