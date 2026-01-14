import crypto from 'crypto';

// Clave de cifrado desde variables de entorno
// @ts-ignore
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || import.meta.env.ENCRYPTION_KEY || 'default-key-change-in-production-32');
const ALGORITHM = 'aes-256-cbc';

if (ENCRYPTION_KEY === 'default-key-change-in-production-32') {
    console.warn('[Crypto] ADVERTENCIA: Usando clave de cifrado por defecto en Astro.');
} else {
    console.log(`[Crypto] Astro cargó clave: ${ENCRYPTION_KEY.substring(0, 3)}...${ENCRYPTION_KEY.substring(ENCRYPTION_KEY.length - 3)}`);
}

// Asegurar que la clave tenga exactamente 32 bytes
function getKey(): Buffer {
    const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
    return Buffer.from(key);
}

/**
 * Retorna el IV y el texto cifrado separados por ':'
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornar IV:encrypted para poder descifrar despues
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descifra un texto cifrado con encrypt()
 * Espera formato IV:encrypted
 */
export function decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error('Formato de texto cifrado invalido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
