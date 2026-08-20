import type { H3Event } from 'h3'
import type { Methods } from '../../types/methods.type.js'

export interface CookieOptions {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  partitioned?: boolean
}

export interface BaseContext<
  TParams = Record<string, any>,
  TQuery = Record<string, any>,
  THeaders = Record<string, string | undefined>,
  TState extends Record<string, any> = Record<string, any>,
> {
  readonly params: TParams
  readonly query: TQuery
  readonly headers: THeaders
  readonly method: Methods
  readonly path: string
  readonly url: string
  readonly ip?: string
  readonly raw: H3Event

  status(code: number): this
  setHeader(name: string, value: string | number | readonly string[]): this
  getHeader(name: string): string | undefined
  getCookie(name: string): string | undefined
  setCookie(name: string, value: string, options?: CookieOptions): this
  deleteCookie(name: string, options?: CookieOptions): this
  redirect(location: string, statusCode?: number): void

  readonly state: TState
  set<K extends keyof TState>(key: K, value: TState[K]): void
  set(key: string, value: any): void
  get<K extends keyof TState>(key: K): TState[K]
  get<T = any>(key: string): T | undefined
}

export type SafeContext<
  TParams = Record<string, any>,
  TQuery = Record<string, any>,
  THeaders = Record<string, string | undefined>,
  TState extends Record<string, any> = Record<string, any>,
> = BaseContext<TParams, TQuery, THeaders, TState>

export interface BodyContext<
  TBody = any,
  TParams = Record<string, any>,
  TQuery = Record<string, any>,
  THeaders = Record<string, string | undefined>,
  TState extends Record<string, any> = Record<string, any>,
> extends BaseContext<TParams, TQuery, THeaders, TState> {
  readonly body: TBody
}

export type XantoContext<
  TBody = any,
  TParams = Record<string, any>,
  TQuery = Record<string, any>,
  THeaders = Record<string, string | undefined>,
  TState extends Record<string, any> = Record<string, any>,
> = BaseContext<TParams, TQuery, THeaders, TState> & {
  readonly body?: TBody
}
