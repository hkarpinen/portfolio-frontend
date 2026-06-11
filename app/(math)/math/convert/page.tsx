import type { Metadata } from "next";
import { ConverterClient } from "./converter-client";

export const metadata: Metadata = {
  title: "Unit Converter",
  description:
    "Convert length, mass, temperature, volume, speed, area, and digital storage. A pure domain engine built with DDD — one of six microservices in The Stack & Gazette.",
  alternates: { canonical: "/math/convert" },
  openGraph: {
    title: "Unit Converter — The Stack & Gazette",
    description:
      "Convert length, mass, temperature, volume, speed, area, and data. A pure domain engine built with DDD.",
    url: "/math/convert",
    type: "website",
  },
  twitter: {
    title: "Unit Converter — The Stack & Gazette",
    description:
      "Convert length, mass, temperature, volume, speed, area, and data. A pure domain engine built with DDD.",
  },
};

export default function ConvertPage() {
  return <ConverterClient />;
}
