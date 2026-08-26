import type { H3Event } from 'h3'
import type { Methods } from '../../types/methods.type.js'
import type { StateManager } from './stateManager.type.js'
import type { CookieOptions } from './cookieOptions.type.js'
import type { HttpStatusCode } from './httpStatusCode.type.js'

export interface BaseContext<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
  THeaders extends Record<string, string | undefined> = Record<string, string | undefined>,
  TState extends object = Record<string, unknown>,
> {
  readonly params: Readonly<TParams>
  readonly query: Readonly<TQuery>
  readonly headers: Readonly<THeaders>
  readonly method: Methods
  readonly path: string
  readonly url: string
  readonly ip?: string | undefined
  readonly raw: H3Event

  status(code: HttpStatusCode): this
  setHeader(name: string, value: string | number | readonly string[]): this
  getHeader(name: string): string | undefined
  getCookie(name: string): string | undefined
  setCookie(name: string, value: string, options?: CookieOptions): this
  deleteCookie(name: string, options?: CookieOptions): this
  redirect(location: string, statusCode?: number): void

  readonly state: StateManager<TState>
}

export interface SafeContext<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
  THeaders extends Record<string, string | undefined> = Record<string, string | undefined>,
  TState extends object = Record<string, unknown>,
> extends BaseContext<TParams, TQuery, THeaders, TState> {
  readonly body?: never
}

export interface BodyContext<
  TBody = unknown,
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
  THeaders extends Record<string, string | undefined> = Record<string, string | undefined>,
  TState extends object = Record<string, unknown>,
> extends BaseContext<TParams, TQuery, THeaders, TState> {
  readonly body: Readonly<TBody>
}

export type XantoContext<
  TBody = unknown,
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
  THeaders extends Record<string, string | undefined> = Record<string, string | undefined>,
  TState extends object = Record<string, unknown>,
> = BaseContext<TParams, TQuery, THeaders, TState> & {
  readonly body?: Readonly<TBody> | undefined
}
