import { string } from './builders/string.js'
import { number } from './builders/number.js'
import { boolean } from './builders/boolean.js'
import { array } from './builders/array.js'
import { object } from './builders/object.js'
import { enumType } from './builders/enum.js'
import { literal } from './builders/literal.js'
import { date } from './builders/date.js'
import { union } from './builders/union.js'
import { any, unknown } from './builders/any.js'

export const t = {
  string,
  number,
  boolean,
  array,
  object,
  enum: enumType,
  literal,
  date,
  union,
  any,
  unknown,
}
