import { api } from "@/lib/api-client";
import { WeatherDtoSchema } from "@/types/geography";

export const fetchWeather = (city: string) =>
  api.parsed.get(`/api/geography/weather?city=${encodeURIComponent(city)}`, WeatherDtoSchema);
