export function mergeHeaderObj(headerObj1: Record<string, string | string[]>, headerObj2: Record<string, string | string[]>): Record<string, string | string[]> {
  // 如果 两个 object 中有相同的 key 请按下列逻辑处理:
  // 1. 如果它们的 value 都是 string 则合并结果是 string[];
  // 2. 如果它们的 value 中有一个或都是 string[] 则将他们合并成 string[]
  // 如果 key 不相同，则按照原有的值做合并

  const obj = {...headerObj1};

  Object.keys(headerObj2).forEach((key) => {
    if (obj[key] === undefined) {
      obj[key] = headerObj2[key];
    } else {
      if (Array.isArray(obj[key])) {
        if (Array.isArray(headerObj2[key])) {
          obj[key] = obj[key].concat(headerObj2[key]);
        } else {
          obj[key].push(headerObj2[key]);
        }
      } else {
        if (Array.isArray(headerObj2[key])) {
          obj[key] = [obj[key], ...headerObj2[key]];
        } else {
          obj[key] = [obj[key], headerObj2[key]];
        }
      }
    }
  })

  return obj;
}
