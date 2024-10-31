export const getIdFromPath = (pathname: string) => {
  return pathname.split('/').pop();
}
