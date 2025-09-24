import { nanoid } from 'nanoid';

export const createResponse = (code: number, msg: string, data?: any) => {
  const status = code >= 200 && code < 300 ? 'success' : 'error';
  return new Response(
    JSON.stringify({
      code,
      msg,
      data,
      status,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      status: code,
    }
  );
};

export const nanoIDNormalizador = (prefijoId: string, nId = 12) => {
  const id = nanoid(nId);
  return `${prefijoId}_${id}`;
};
