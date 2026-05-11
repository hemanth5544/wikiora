type TokenGetter = () => Promise<string | null>

let tokenGetter: TokenGetter | null = null

export function setAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter
}

export async function getAuthToken() {
  if (!tokenGetter) {
    return null
  }
  return tokenGetter()
}
