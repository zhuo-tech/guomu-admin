
const kToken = 'access_token'
const kExpire = 'token_expire'

export function getToken() {
  const token = localStorage.getItem(kToken)
  const expire = parseInt(localStorage.getItem(kExpire) || 0)

  if (!expire || expire <= Date.now()) {
    removeToken()
  }

  return token
}

export function setToken(token, expire) {
  localStorage.setItem(kExpire, expire)
  return localStorage.setItem(kToken, token)
}

export function removeToken() {
  localStorage.removeItem(kExpire)
  return localStorage.removeItem(kToken)
}
