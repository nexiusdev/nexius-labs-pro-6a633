const SECRET_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /authorization/i,
  /api[_-]?key/i,
  /cookie/i,
  /credential/i,
];

function shouldRedactKey(key: string) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(key));
}

export function redactSensitive<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => redactSensitive(item)) as T;
  }

  if (!input || typeof input !== "object") {
    return input;
  }

  const obj = input as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (shouldRedactKey(key)) {
      output[key] = "[REDACTED]";
      continue;
    }

    output[key] = redactSensitive(value);
  }

  return output as T;
}
