import {setting} from "@prisma/client";

interface UseSettingMapProps<T> {
  setting: Map<string, setting>;
  baseKey: string;
  subKeys: Array<keyof T> | Record<keyof T, string | number | boolean>;
}

type UseSettingMapReturn<T> = Record<keyof T, boolean | string | number | null | undefined>;

export default function useSettingMap<T>(props: UseSettingMapProps<T>): UseSettingMapReturn<T> {
  const {setting, baseKey, subKeys} = props;

  const result: UseSettingMapReturn<T> | null = {} as UseSettingMapReturn<T>;
  const subKeysArray = Array.isArray(subKeys) ? subKeys : Object.keys(subKeys);


  // every key is make up of baseKey + '.' + subKey

  subKeysArray.map((subKey) => {
    const key = `${baseKey}.${String(subKey)}`;
    const tmp = setting.get(key)?.value

    if (tmp === 'false') {
      result[subKey as keyof T] = false;
    } else if (tmp === 'true') {
      result[subKey as keyof T] = true;
    } else if (tmp === 'null') {
      result[subKey as keyof T] = null;
    } else if (tmp === 'undefined') {
      result[subKey as keyof T] = undefined;
    } else if (!isNaN(Number(tmp))) {
      result[subKey as keyof T] = Number(tmp);
    } else if (!tmp && !Array.isArray(subKeys)) {
      result[subKey as keyof T] = subKeys[subKey as keyof T];
    } else {
      result[subKey as keyof T] = tmp
    }
  })

  return result;
}
