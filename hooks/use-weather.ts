import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/lib/api/weather";
import { geographyKeys } from "@/lib/query-keys";
import type { WeatherDto } from "@/types/geography";

export function useWeather(city: string | null) {
  return useQuery<WeatherDto>({
    queryKey: geographyKeys.weather(city ?? ""),
    queryFn: () => fetchWeather(city!),
    enabled: !!city && city.trim().length > 0,
    staleTime: 5 * 60_000, // 5 minutes
    retry: false,
  });
}
