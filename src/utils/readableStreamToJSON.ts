export async function readableStreamToJSON<T>(
  readableStream: ReadableStream<Uint8Array> | null
): Promise<T | string> {
  if (!readableStream) return '';

  const reader = readableStream.getReader();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += new TextDecoder().decode(value);
  }
  try {
    return JSON.parse(result);
  } catch (e) {
    console.error(e);
    return result;
  }
}
