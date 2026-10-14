import { ScanError } from './scan.error.js'

export class RouteConflictError extends ScanError {
  constructor(message: string, public readonly path?: string) {
    super(message)
    this.name = 'RouteConflictError'
  }
}
