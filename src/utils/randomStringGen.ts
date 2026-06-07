export function RandomStringGen(len: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/!@#$%^&*()_+';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function validateCodeGen(len: number, isSimple = false): string {
  const charset = isSimple ? '0123456789' : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}
