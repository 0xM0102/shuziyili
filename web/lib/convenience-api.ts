import type { NavIconName } from "@/components/icons/nav-icons";
import { fetchPublicApiData } from "@/lib/api-base";
import {
  convenienceCategories,
  convenienceServices,
  type ConvenienceCategory,
  type ConvenienceService,
  type ConvenienceServiceStatus,
} from "@/lib/convenience-data";

export type ConveniencePayload = {
  categories: ConvenienceCategory[];
  services: ConvenienceService[];
  updatedAt: number;
};

const fallbackPayload: ConveniencePayload = {
  categories: convenienceCategories,
  services: convenienceServices,
  updatedAt: 0,
};

const knownIcons = new Set<string>([
  "hot",
  "event",
  "news",
  "nomad",
  "convenience",
  "travel",
  "attractions",
  "stay",
  "food",
  "guide",
  "government",
  "health",
  "shipping",
  "transport",
  "telecom",
  "banking",
  "shopping",
  "repair",
  "emergency",
  "community",
]);

const knownStatuses = new Set<string>(["common", "external", "pending", "verified"]);

export async function fetchConveniencePayload(): Promise<ConveniencePayload> {
  const data = await fetchPublicApiData<Partial<ConveniencePayload>>(
    "/convenience",
    fallbackPayload
  );
  const categories = Array.isArray(data.categories)
    ? data.categories.map(normalizeCategory).filter(isPresent)
    : fallbackPayload.categories;
  const services = Array.isArray(data.services)
    ? data.services.map(normalizeService).filter(isPresent)
    : fallbackPayload.services;

  return {
    categories: categories.length > 0 ? categories : fallbackPayload.categories,
    services,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };
}

function normalizeCategory(item: unknown): ConvenienceCategory | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const slug = asString(raw.slug);
  const title = asString(raw.title);
  if (!slug || !title) return null;
  const shortTitle = asString(raw.shortTitle) || title;
  return {
    slug,
    title,
    shortTitle,
    description: asString(raw.description),
    icon: normalizeIcon(asString(raw.icon)),
    keywords: asStringList(raw.keywords),
  };
}

function normalizeService(item: unknown): ConvenienceService | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const id = asString(raw.id);
  const title = asString(raw.title);
  const category = asString(raw.category);
  if (!id || !title || !category) return null;
  const status = asString(raw.status);
  return {
    id,
    title,
    category,
    area: asString(raw.area),
    address: asString(raw.address),
    contact: asString(raw.contact),
    hours: asString(raw.hours),
    summary: asString(raw.summary),
    tags: asStringList(raw.tags),
    status: normalizeStatus(status),
    sourceUrl: asOptionalString(raw.sourceUrl),
    mapUrl: asOptionalString(raw.mapUrl),
    emergency: raw.emergency === true,
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown): string | undefined {
  const text = asString(value);
  return text || undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeIcon(value: string): NavIconName {
  return knownIcons.has(value) ? (value as NavIconName) : "convenience";
}

function normalizeStatus(value: string): ConvenienceServiceStatus {
  return knownStatuses.has(value) ? (value as ConvenienceServiceStatus) : "pending";
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}
