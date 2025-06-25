export function getDate(time: number) {
  return new Date(time).toLocaleDateString();
}

export function getTime(time: number) {
  return new Date(time).toLocaleTimeString();
}
