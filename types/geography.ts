import { z } from "zod";

// Mirrors Geography.Application.Dtos.WeatherDto
export const WeatherDtoSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperatureCelsius: z.number(),
  feelsLikeCelsius: z.number(),
  humidity: z.number(),
  pressure: z.number(),
  description: z.string(),
  iconCode: z.string(),
  windSpeedMs: z.number(),
  visibilityMeters: z.number(),
  latitude: z.number(),
  longitude: z.number(),
});
export type WeatherDto = z.infer<typeof WeatherDtoSchema>;

export enum WeatherUnit {
  Metric = "metric",
  Imperial = "imperial",
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}
