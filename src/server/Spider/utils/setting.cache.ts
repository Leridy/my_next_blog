// 将系统配置存放在 Node 内存中，方便快速访问
// 通过读取数据库中的配置，将配置存放在内存中，方便快速访问

import { setting } from '@prisma/client';

const isProd = process.env.CURRENT_ENV === 'production';

// in edge function, global is not defined, there is a globalThis to replace it

if (isProd) {
  // @ts-expect-error – Prisma Client Type
  if (!globalThis.innerSpiderSetting) {
    // @ts-expect-error – Prisma Client Type
    globalThis.innerSpiderSetting = null;
  }
} else {
  // @ts-expect-error – Prisma Client Type
  if (!global.innerSpiderSetting) {
    // @ts-expect-error – Prisma Client Type
    global.innerSpiderSetting = null;
  }
}

export const updateSetting = (settings: Map<string, setting> | null) => {
  if (isProd) {
    // @ts-expect-error – Prisma Client Type
    globalThis.innerSpiderSetting = settings;
  } else {
    // @ts-expect-error – Prisma Client Type
    global.innerSpiderSetting = settings;
  }
};

export const getSetting = (): Map<string, setting> | null | undefined => {
  if (isProd) {
    // @ts-expect-error – Prisma Client Type
    return globalThis.innerSpiderSetting as Map<string, setting> | null | undefined;
  } else {
    // @ts-expect-error – Prisma Client Type
    return global.innerSpiderSetting as Map<string, setting> | null | undefined;
  }
};
