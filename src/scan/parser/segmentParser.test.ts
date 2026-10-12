import { describe, expect, it } from 'vitest'
import { parseSegment } from './segmentParser.js'

describe('parseSegment', () => {
  it('parses static segments and lowercases them', () => {
    expect(parseSegment('users')).toEqual({
      raw: 'users',
      type: 'static',
      value: 'users',
    })

    expect(parseSegment('Settings')).toEqual({
      raw: 'Settings',
      type: 'static',
      value: 'settings',
    })

    expect(parseSegment('API_V1')).toEqual({
      raw: 'API_V1',
      type: 'static',
      value: 'api_v1',
    })
  })

  it('handles spaces around segment string', () => {
    expect(parseSegment('  posts  ')).toEqual({
      raw: 'posts',
      type: 'static',
      value: 'posts',
    })

    expect(parseSegment('  [id]  ')).toEqual({
      raw: '[id]',
      type: 'dynamic',
      value: ':id',
      paramName: 'id',
    })
  })

  it('parses group segments without affecting URL value', () => {
    expect(parseSegment('(admin)')).toEqual({
      raw: '(admin)',
      type: 'group',
      value: null,
    })

    expect(parseSegment('(AUTH)')).toEqual({
      raw: '(AUTH)',
      type: 'group',
      value: null,
    })
  })

  it('throws on empty group segment', () => {
    expect(() => parseSegment('()')).toThrow(/Invalid empty route group/)
    expect(() => parseSegment('(   )')).toThrow(/Invalid empty route group/)
  })

  it('parses dynamic segments [id]', () => {
    expect(parseSegment('[id]')).toEqual({
      raw: '[id]',
      type: 'dynamic',
      value: ':id',
      paramName: 'id',
    })

    expect(parseSegment('[userId]')).toEqual({
      raw: '[userId]',
      type: 'dynamic',
      value: ':userid',
      paramName: 'userid',
    })

    expect(parseSegment('[post_id]')).toEqual({
      raw: '[post_id]',
      type: 'dynamic',
      value: ':post_id',
      paramName: 'post_id',
    })
  })

  it('throws on empty dynamic brackets []', () => {
    expect(() => parseSegment('[]')).toThrow(/Invalid empty parameter syntax/)
    expect(() => parseSegment('[   ]')).toThrow(/Invalid empty parameter syntax/)
  })

  it('parses typed dynamic segments [id::type]', () => {
    expect(parseSegment('[id::number]')).toEqual({
      raw: '[id::number]',
      type: 'typed-dynamic',
      value: ':id',
      paramName: 'id',
      paramType: 'number',
    })

    expect(parseSegment('[code::uuid]')).toEqual({
      raw: '[code::uuid]',
      type: 'typed-dynamic',
      value: ':code',
      paramName: 'code',
      paramType: 'uuid',
    })

    expect(parseSegment('[IS_ACTIVE::BOOLEAN]')).toEqual({
      raw: '[IS_ACTIVE::BOOLEAN]',
      type: 'typed-dynamic',
      value: ':is_active',
      paramName: 'is_active',
      paramType: 'boolean',
    })
  })

  it('throws on malformed typed dynamic segments', () => {
    expect(() => parseSegment('[id::]')).toThrow(/Invalid typed parameter syntax/)
    expect(() => parseSegment('[::number]')).toThrow(/Invalid typed parameter syntax/)
    expect(() => parseSegment('[id::number::extra]')).toThrow(/Invalid typed parameter syntax/)
    expect(() => parseSegment('[  ::  ]')).toThrow(/Invalid typed parameter syntax/)
  })

  it('parses catch-all segments [...slug]', () => {
    expect(parseSegment('[...slug]')).toEqual({
      raw: '[...slug]',
      type: 'catch-all',
      value: '**',
      paramName: 'slug',
    })

    expect(parseSegment('[...FILE_PATH]')).toEqual({
      raw: '[...FILE_PATH]',
      type: 'catch-all',
      value: '**',
      paramName: 'file_path',
    })
  })

  it('rejects anonymous catch-all [...] per Section 8 of spec', () => {
    expect(() => parseSegment('[...]')).toThrow(/Anonymous catch-all segment/)
    expect(() => parseSegment('[...  ]')).toThrow(/Anonymous catch-all segment/)
  })

  it('rejects typed catch-all [...slug::number] per Section 8 of spec', () => {
    expect(() => parseSegment('[...slug::number]')).toThrow(/Typed catch-all segment/)
  })
})
