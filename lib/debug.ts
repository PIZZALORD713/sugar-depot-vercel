export function debug(ns: string, ...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[${ns}]`, ...args);
  }
}
