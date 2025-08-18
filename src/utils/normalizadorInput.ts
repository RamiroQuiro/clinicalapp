// utils/normalizer.ts

type SchemaType = 'string' | 'number' | 'date' | 'boolean';

export function normalize<T>(data: Record<string, any>, schema: Record<keyof T, SchemaType>): T {
  const normalized: Partial<T> = {};

  for (const key in schema) {
    const type = schema[key];
    const value = data[key];

    if (value === '' || value === null || value === undefined) {
      (normalized as any)[key] = null;
      continue;
    }

    switch (type) {
      case 'number':
        (normalized as any)[key] = Number(value);
        break;
      case 'date':
        (normalized as any)[key] = new Date(value);
        break;
      case 'boolean':
        (normalized as any)[key] = value === 'true' || value === true;
        break;
      case 'string':
      default:
        (normalized as any)[key] = String(value);
    }
  }

  return normalized as T;
}
