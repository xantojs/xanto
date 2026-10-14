import { ScanError } from './scan.error.js'

export class SegmentSyntaxError extends ScanError {
  constructor(message: string, public readonly segment?: string) {
    super(message)
    this.name = 'SegmentSyntaxError'
  }
}
