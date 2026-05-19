// Mirrors Geography.Application.Dtos.WeatherDto
export interface WeatherDto {
  city: string;
  country: string;
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  humidity: number;
  pressure: number;
  description: string;
  iconCode: string;
  windSpeedMs: number;
  visibilityMeters: number;
  latitude: number;
  longitude: number;
}

export type WeatherUnit = "metric" | "imperial";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}
