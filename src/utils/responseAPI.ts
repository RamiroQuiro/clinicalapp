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
