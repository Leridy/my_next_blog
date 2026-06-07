export function cookie2Obj(cookie: string): Record<string, string> {
  return cookie.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key.trim()] = value;
      return acc;
    },
    {} as Record<string, string>
  );
}

export function getCookie(key: string): string | undefined {
  return cookie2Obj(document.cookie)[key];
}

export function setCookie(
  key: string,
  value: string,
  options: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
) {
  let cookie = `${key}=${value}`;
  if (options.expires) {
    if (options.expires instanceof Date) {
      cookie += `; expires=${options.expires.toUTCString()}`;
    } else {
      cookie += `; max-age
        =${options.expires}`;
    }
  }
  if (options.path) {
    cookie += `; path=${options.path}`;
  }
  if (options.domain) {
    cookie += `; domain=${options.domain}`;
  }

  document.cookie = cookie;
}
