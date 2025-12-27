export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export type AllowedMimeType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';

interface FileValidationResult {
    isValid: boolean;
    error?: string;
    detectedType?: string;
}

const MAGIC_NUMBERS: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF (parcial, WebP es más complejo pero esto filtra basura obvia)
};

/**
 * Valida el tamaño y el tipo real (magic numbers) de un archivo ArrayBuffer.
 * Implementación "Zero-Dependency" para evitar librerías pesadas.
 */
export async function validateFile(
    fileBuffer: ArrayBuffer,
    fileName: string
): Promise<FileValidationResult> {
    // 1. Validación de Tamaño
    if (fileBuffer.byteLength > FILE_SIZE_LIMIT) {
        return {
            isValid: false,
            error: `El archivo excede el límite de 5MB (Tamaño: ${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)}MB)`,
        };
    }

    // 2. Validación de Magic Numbers (Tipo Real)
    const buffer = new Uint8Array(fileBuffer).slice(0, 4);
    let detectedMime: AllowedMimeType | null = null;

    // Chequeo simple de firmas
    if (checkSignature(buffer, MAGIC_NUMBERS['application/pdf'])) detectedMime = 'application/pdf';
    else if (checkSignature(buffer, MAGIC_NUMBERS['image/jpeg'])) detectedMime = 'image/jpeg';
    else if (checkSignature(buffer, MAGIC_NUMBERS['image/png'])) detectedMime = 'image/png';

    // WebP check is tricky just with 4 bytes (RIFF), but good enough for rough filter combined with extension
    // usually RIFF....WEBP. Let's trust extension IF signature is RIFF, or skip strict magic check for webp to avoid false negatives without lib
    // For now, let's stick to strict PDF/JPG/PNG as they are 99% of medical uploads.

    if (!detectedMime) {
        return {
            isValid: false,
            error: 'Formato de archivo no reconocido o no soportado. Solo se permiten PDF, JPG y PNG.',
        };
    }

    return { isValid: true, detectedType: detectedMime };
}

function checkSignature(buffer: Uint8Array, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) return false;
    }
    return true;
}

/**
 * Limpia el nombre del archivo para evitar Path Traversal y caracteres raros.
 */
export function sanitizeFileName(fileName: string): string {
    // Elimina directorios (../), espacios y caracteres especiales
    return fileName
        .replace(/^.*[\\\/]/, '') // Quita paths
        .replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Reemplaza caracteres raros con _
}
