export const getStorage = async (key: string) => {
  const value = window.localStorage.getItem(`@${key}`)
  if (!value) return false
  return JSON.parse(value)
}

export const setStorage = async (key: string, data: any) => {
  return window.localStorage.setItem(`@${key}`, JSON.stringify(data))
}

export const clearStorage = async () => {
  return window.localStorage.clear()
}
