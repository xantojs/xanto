import { describe, expect, it } from 'vitest'
import { parseSegment } from './segmentParser.js'
import { SegmentSyntaxError } from '../errors/syntax.error.js'

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

  it('throws SegmentSyntaxError on empty group segment', () => {
    expect(() => parseSegment('()')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('(   )')).toThrow(SegmentSyntaxError)
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

  it('throws SegmentSyntaxError on empty dynamic brackets []', () => {
    expect(() => parseSegment('[]')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('[   ]')).toThrow(SegmentSyntaxError)
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

  it('throws SegmentSyntaxError on malformed typed dynamic segments', () => {
    expect(() => parseSegment('[id::]')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('[::number]')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('[id::number::extra]')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('[  ::  ]')).toThrow(SegmentSyntaxError)
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

  it('rejects anonymous catch-all [...] with SegmentSyntaxError per Section 8 of spec', () => {
    expect(() => parseSegment('[...]')).toThrow(SegmentSyntaxError)
    expect(() => parseSegment('[...  ]')).toThrow(SegmentSyntaxError)
  })

  it('rejects typed catch-all [...slug::number] with SegmentSyntaxError per Section 8 of spec', () => {
    expect(() => parseSegment('[...slug::number]')).toThrow(SegmentSyntaxError)
  })
})
