export function resolveApiError(
  err: unknown,
  t: (key: string) => string,
  keyMap: Record<string, string> = {},
): string {
  const data = (
    err as {
      response?: { data?: { message?: string | string[] } }
    }
  )?.response?.data
  const msg = Array.isArray(data?.message) ? data?.message[0] : data?.message
  if (typeof msg === 'string' && keyMap[msg]) {
    return t(keyMap[msg])
  }
  return t('common.error')
}
