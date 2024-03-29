import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
  // const token = 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VyX2tleSI6ImNiN2RiZjIzLTk4MGQtNDc0Ny04OGIyLWNiNTZmYTg0MDhhYSIsInVzZXJuYW1lIjoiYWRtaW4ifQ.3SFapS8BoaT6ra0Z0rgggh-HzsuXhDnlyUjwnAfx5zQ4mhX5zQUXPyzO-T28Ot-7vi4kRSUSMZ45ys5kuW522A';
  // return token;
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
