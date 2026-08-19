import { HTTP_METHODS } from '../const/httpMethods.const.js'

import type { Methods } from '../../types/routing/methods.type.js'

export function extractMethod(filename: string): Methods | null {
  const nameWithoutExt = filename.replace(/\.ts$/, '')

  for (const method of HTTP_METHODS) {
    const methodLower = method.toLowerCase()

    if (nameWithoutExt === methodLower) {
      return method
    }

    if (nameWithoutExt.endsWith(`.${methodLower}`)) {
      return method
    }
  }

  return null
}
