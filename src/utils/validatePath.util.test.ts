import { describe, it, expect } from 'vitest'
import { validatePath } from './validatePath.util.js'

describe('validatePath', () => {
  describe('Valid paths', () => {
    it('should accept simple path', () => {
      expect(validatePath('src')).toBe('src')
    })

    it('should accept dot as basePath', () => {
      expect(validatePath('.')).toBe('.')
    })

    it('should accept nested paths', () => {
      expect(validatePath('src/api')).toBe('src/api')
      expect(validatePath('routes/api/v1')).toBe('routes/api/v1')
    })

    it('should accept paths with hyphens and underscores', () => {
      expect(validatePath('my-routes')).toBe('my-routes')
      expect(validatePath('my_routes')).toBe('my_routes')
      expect(validatePath('my-route_v1')).toBe('my-route_v1')
    })

    it('should accept paths with numbers', () => {
      expect(validatePath('api/v1')).toBe('api/v1')
      expect(validatePath('routes2')).toBe('routes2')
    })

    it('should accept relative paths with ../', () => {
      expect(validatePath('../routes')).toBe('../routes')
      expect(validatePath('../../api')).toBe('../../api')
    })

    it('should accept relative paths with ./', () => {
      expect(validatePath('./routes')).toBe('./routes')
    })

    it('should accept complex relative paths', () => {
      expect(validatePath('./../routes')).toBe('./../routes')
      expect(validatePath('.././api')).toBe('.././api')
    })
  })

  describe('Invalid paths - empty', () => {
    it('should reject empty string', () => {
      expect(() => validatePath('')).toThrow('Path cannot be empty')
    })
  })

  describe('Invalid paths - absolute', () => {
    it('should reject paths starting with /', () => {
      expect(() => validatePath('/src')).toThrow()
      expect(() => validatePath('/routes/api')).toThrow()
    })
  })

  describe('Invalid paths - double slashes', () => {
    it('should reject paths with //', () => {
      expect(() => validatePath('src//api')).toThrow()
      expect(() => validatePath('routes//api//v1')).toThrow()
    })
  })

  describe('Invalid paths - dot segments', () => {
    it('should reject paths with /./', () => {
      expect(() => validatePath('src/./api')).toThrow()
      expect(() => validatePath('routes/./something')).toThrow()
    })

    it('should reject paths with /../', () => {
      expect(() => validatePath('routes/../api')).toThrow()
      expect(() => validatePath('src/api/../routes')).toThrow()
    })

    it('should reject paths ending with /..', () => {
      expect(() => validatePath('routes/..')).toThrow()
      expect(() => validatePath('src/api/..')).toThrow()
    })

    it('should reject paths ending with /.', () => {
      expect(() => validatePath('routes/.')).toThrow()
      expect(() => validatePath('src/.')).toThrow()
    })

    it('should reject path traversal mixed inside', () => {
      expect(() => validatePath('src/../api/..')).toThrow()
      expect(() => validatePath('src/..../api')).toThrow()
    })
  })

  describe('Invalid paths - invalid characters', () => {
    it('should reject paths with spaces', () => {
      expect(() => validatePath('src api')).toThrow()
      expect(() => validatePath('my routes')).toThrow()
    })

    it('should reject paths with special characters', () => {
      expect(() => validatePath('src@api')).toThrow()
      expect(() => validatePath('routes#api')).toThrow()
      expect(() => validatePath('src$api')).toThrow()
      expect(() => validatePath('routes&api')).toThrow()
    })
  })

  describe('Error messages', () => {
    it('should include path in error message', () => {
      try {
        validatePath('/src')
      } catch (e) {
        expect((e as Error).message).toContain('/src')
      }
    })

    it('should have descriptive error message', () => {
      try {
        validatePath('src/./api')
      } catch (e) {
        expect((e as Error).message).toContain('Invalid path')
      }
    })
  })
})
