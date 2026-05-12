type TokenGetter = () => Promise<string | null>

let tokenGetter: TokenGetter | null = null
let authReady = false

export function setAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter
  authReady = true
}

export function clearAuthTokenGetter() {
  tokenGetter = null
  authReady = false
}

export function isAuthReady() {
  return authReady
}

export async function getAuthToken() {
  if (!tokenGetter) {
    return null
  }
  return tokenGetter()
}
