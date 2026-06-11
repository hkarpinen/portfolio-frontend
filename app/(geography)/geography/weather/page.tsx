import type { Metadata } from "next";
import { WeatherClient } from "./weather-client";

export const metadata: Metadata = {
  title: "Weather",
  description:
    "Live weather by city — current conditions, °F/°C toggle, and an interactive Leaflet map. One of six microservices in The Stack & Gazette.",
  alternates: { canonical: "/geography/weather" },
  openGraph: {
    title: "Weather — The Stack & Gazette",
    description:
      "Live weather by city with an interactive Leaflet map. One of six microservices powering Hank Karpinen's portfolio.",
    url: "/geography/weather",
    type: "website",
  },
  twitter: {
    title: "Weather — The Stack & Gazette",
    description:
      "Live weather by city with an interactive Leaflet map. One of six microservices powering Hank Karpinen's portfolio.",
  },
};

export default function WeatherPage() {
  return <WeatherClient />;
}
