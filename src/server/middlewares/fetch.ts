import fetch from 'node-fetch';
import env from '../../../.project.json';

export async function fetcher(url: string, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      cookie: `INNER_TOKEN=${env.INNER_TOKEN}`,
    },
  });

  console.log('res', res);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
}
