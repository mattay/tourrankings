export function randomFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/a/51200664/5250085
export function sleep(milliseconds = 500) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
