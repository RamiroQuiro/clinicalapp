// utils/normalizer.ts

type FieldSchema = { type: 'string' | 'number' | 'date' | 'boolean'; optional?: boolean };

export function normalize<T>(data: Record<string, any>, schema: Record<keyof T, FieldSchema>): T {
  const normalized: Partial<T> = {};

  for (const key in schema) {
    const fieldSchema = schema[key];
    const value = data[key];

    // Si el campo es opcional y no está presente o es vacío, lo omitimos o lo ponemos a null
    if (fieldSchema.optional && (value === '' || value === null || value === undefined)) {
      // Si es opcional y no viene, no lo incluimos en el objeto normalizado
      continue;
    }

    // Si no es opcional o si es opcional pero viene con valor
    if (value === '' || value === null || value === undefined) {
      (normalized as any)[key] = null; // Para campos no opcionales que vienen vacíos
      continue;
    }

    switch (fieldSchema.type) {
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
