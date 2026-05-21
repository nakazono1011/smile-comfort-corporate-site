function slugify(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const slug = input
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return slug || undefined;
}

export function uniqueSlug(
  input: unknown,
  registry: Map<string, number>,
): string | undefined {
  const base = slugify(input);
  if (!base) return undefined;

  const count = registry.get(base) ?? 0;
  registry.set(base, count + 1);

  return count === 0 ? base : `${base}-${count + 1}`;
}

export function ensureUniqueId(baseId: string, usedIds: Set<string>): string {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }

  let suffix = 2;
  let candidate = `${baseId}-${suffix}`;
  while (usedIds.has(candidate)) {
    suffix += 1;
    candidate = `${baseId}-${suffix}`;
  }

  usedIds.add(candidate);
  return candidate;
}
