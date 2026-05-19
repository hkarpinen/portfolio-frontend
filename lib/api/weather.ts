import { api } from "@/lib/api-client";
import type { WeatherDto } from "@/types/geography";

export const fetchWeather = (city: string) =>
  api.get<WeatherDto>(`/api/geography/weather?city=${encodeURIComponent(city)}`);
