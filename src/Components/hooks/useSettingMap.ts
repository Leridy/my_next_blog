import {setting} from "@prisma/client";

interface UseSettingMapProps {
  setting: Map<string, setting>;
  baseKey: string;
  subKeys: string[];
}

type UseSettingMapReturn = Record<string, boolean | string | number | null | undefined>;

export default function useSettingMap(props: UseSettingMapProps): UseSettingMapReturn {
  const {setting, baseKey, subKeys} = props;

  const result: UseSettingMapReturn = {};

  // every key is make up of baseKey + '.' + subKey

  subKeys.map((subKey) => {
    const key = `${baseKey}.${subKey}`;
    const tmp = setting.get(key)?.value || '';

    if (tmp === 'false') {
      result[subKey] = false;
    } else if (tmp === 'true') {
      result[subKey] = true;
    } else if (tmp === 'null') {
      result[subKey] = null;
    } else if (tmp === 'undefined') {
      result[subKey] = undefined;
    } else if (!isNaN(Number(tmp))) {
      result[subKey] = Number(tmp);
    } else {
      result[subKey] = tmp;
    }
  })

  return result;
}
