# Xanto.JS — Validation System (x.*)

Модуль `@xanto/core/validation` предоставляет легковесную, быструю и полностью типизированную систему валидации данных для HTTP-запросов и бизнес-логики.

Система построена на базе открытой спецификации **Standard Schema v1**, что гарантирует 100% совместимость со всей современной TypeScript-экосистемой (Valibot, Zod 3.24+, ArkType, TypeBox).

---

## 1. Основные концепции

1. **Единый неймспейс `x`:** все билдеры схем доступны через лаконичный объект `x` (`x.string()`, `x.number()`, `x.object()`).
2. **Иммутабельный чейнинг:** каждый вызов метода-модификатора (`.min()`, `.max()`, `.optional()`) возвращает новый независимый экземпляр схемы без мутации базовой.
3. **Строгая защита цепочек вызовов (Type-level Chain Guards):** TypeScript на уровне типов запрещает бессмысленные и конфликтующие повторные вызовы методов в чейнинге.
4. **Универсальные функции `parse` / `safeParse`:** умеют валидировать не только схемы `x.*`, но и схемы из Valibot, Zod и любых других Standard Schema библиотек.

---

## 2. Строгая типизация и защита чейнинга (Type Safety)

Система типов Xanto динамически сужает доступные методы чейнинга по мере их вызова:

### Исключение конфликтующих методов:
* **Строковые форматы:** вызов `.email()` исключает повторный вызов `.email()`, `.url()` и `.uuid()`.
* **Фиксированная длина:** вызов `.length(5)` исключает `.min()` и `.max()`, так как они теряют смысл.
* **Режимы объектов:** вызов `.strict()` исключает повторный вызов `.strict()`, `.passthrough()` или `.strip()`.
* **Однократный coerce:** метод `.coerce()` исчезает из автокомплита после первого применения.

```ts
x.string().email().email()   // ❌ Ошибка TypeScript: метод email уже применен
x.string().length(5).min(2)  // ❌ Ошибка TypeScript: min недоступен после length
x.object({}).strict().strict() // ❌ Ошибка TypeScript
```

### Точный вывод типов (Type Inference):
```ts
import type { InferInput, InferOutput } from '@xanto/core/validation'

const user = x.object({
  id: x.number().coerce(),             // Input: unknown / string | number, Output: number
  role: x.string().default('guest'),   // Input: string | undefined, Output: string
})

type UserInput = InferInput<typeof user>   // { id: number; role?: string | undefined }
type UserOutput = InferOutput<typeof user> // { id: number; role: string }
```

---

## 3. Примитивные типы (Primitives)

| Билдер | Методы чейнинга | Описание и кастомные сообщения |
| :--- | :--- | :--- |
| `x.string(msg?)` | `.min(n, msg?)`<br>`.max(n, msg?)`<br>`.length(n, msg?)`<br>`.email(msg?)`<br>`.url(msg?)`<br>`.uuid(msg?)`<br>`.regex(RegExp, msg?)` | Строка. Каждый метод принимает опциональный текст ошибки `msg` |
| `x.number(msg?)` | `.min(n, msg?)`<br>`.max(n, msg?)`<br>`.integer(msg?)`<br>`.coerce()` | Число. `.coerce()` преобразует строки (`'42'` ➔ `42`) |
| `x.boolean(msg?)` | `.coerce()` | Булево значение. `.coerce()` парсит `'true'`, `'false'`, `1`, `0` |
| `x.date(msg?)` | `.min(Date, msg?)`<br>`.max(Date, msg?)`<br>`.coerce()` | Объект `Date`. `.coerce()` парсит ISO-строки и миллисекунды |
| `x.literal(val, msg?)` | — | Литерал (`x.literal('admin')`, `x.literal(404)`) |
| `x.enum(values, msg?)` | — | Массив строковых значений (`x.enum(['asc', 'desc'])`) |
| `x.any()` | — | Любой тип (`any`) |
| `x.unknown()` | — | Неизвестный тип (`unknown`) |

---

## 4. Сложные типы и структуры (Complex Types)

### `x.object(shape, msg?)`
Описывает структуру объекта:

```ts
import { x } from '@xanto/core/validation'

const userSchema = x.object({
  id: x.string().uuid('ID must be a valid UUID'),
  name: x.string().min(2, 'Name is too short'),
  age: x.number().coerce().min(18).optional(),
  role: x.enum(['admin', 'user']).default('user'),
})
```

**Режимы обработки лишних ключей:**
* **`strip` (по умолчанию):** удаляет неуказанные ключи.
* **`.passthrough()`:** оставляет нераспознанные поля без изменений.
* **`.strict(msg?)`:** выбрасывает ошибку валидации с точным указанием пути к лишнему ключу (`path: ['extraField']`).

### `x.array(elementSchema, msg?)`
* `.min(n, msg?)` — минимальный размер
* `.max(n, msg?)` — максимальный размер
* `.length(n, msg?)` — точный размер

### `x.tuple(items, msg?)`
Кортеж с фиксированной позиционной структурой:
```ts
const point = x.tuple([x.number(), x.number()])
```

### `x.record(keySchema, valueSchema, msg?)`
Словарь (Record) с динамическими ключами:
```ts
const permissions = x.record(x.string(), x.array(x.string()))
```

---

## 5. Логика, трансформация и конвейеры

| Билдер | Пример | Описание |
| :--- | :--- | :--- |
| `x.union([a, b], msg?)` | `x.union([x.string(), x.number()])` | Объединение вариантов |
| `x.nullable(schema)` | `x.nullable(x.string())` | Разрешает `null` |
| `.optional()` | `x.string().optional()` | Разрешает `undefined` |
| `.default(val)` | `x.boolean().default(true)` | Заменяет `undefined` на указанное значение |
| `x.transform(schema, fn)` | `x.transform(x.string(), s => s.trim())` | Трансформация выхода |
| `x.pipe(schema, ...actions)` | `x.pipe(x.string(), trim())` | Конвейер операций |

---

## 6. Выполнение валидации (`parse` / `safeParse`)

Функции `parse()` и `safeParse()` являются **универсальными** раннерами: они принимают любую схему `StandardSchemaV1` — схемы `x.*`, Valibot (`v.*`), Zod (`z.*`) или ArkType.

### `parse(schema, data)`
Асинхронно парсит входные данные. При ошибке выбрасывает `ValidationError`.

```ts
import { parse, x } from '@xanto/core/validation'
import * as v from 'valibot'

// Валидация схемы x.*
const data1 = await parse(x.string().min(3), 'hello')

// Валидация сторонней схемы Valibot через парсер Xanto!
const data2 = await parse(v.string(), 'valid string')

// Выбросит ValidationError с детальным описанием
await parse(v.number(), 'not a number')
```

### `safeParse(schema, data)`
Безопасная валидация без выброса исключений:

```ts
import { safeParse, x } from '@xanto/core/validation'
import { z } from 'zod'

const result = await safeParse(z.number(), '123')

if (result.success) {
  console.log(result.data) // number
} else {
  console.log(result.issues) // StandardIssue[]
}
```

---

## 7. Обработка и структура ошибок (`ValidationError`)

При возникновении ошибок валидации `parse()` выбрасывает экземпляр `ValidationError`.

### Читаемое сообщение `error.message`
Формирует сводный читаемый трейс ошибок с префиксами путей:
```ts
// "user.email: Invalid email; items[0].price: Must be positive"
console.log(error.message)
```

### Методы и структура:
1. **`error.issues`** (`readonly StandardIssue[]`): исходный список ошибок спецификации Standard Schema.
2. **`error.getIssuesForPath(path)`**: выборка ошибок по конкретному полю:
   ```ts
   error.getIssuesForPath('user.email')
   error.getIssuesForPath(['items', 0, 'price'])
   ```
3. **`error.flatten()`**: группировка ошибок в удобную структуру для фронтенда / форм:
   ```ts
   const { formErrors, fieldErrors } = error.flatten()
   // formErrors: ['Invalid request payload']
   // fieldErrors: {
   //   'user.email': ['Invalid email format', 'Email already taken'],
   //   'user.age': ['Must be at least 18']
   // }
   ```
4. **`error.toJSON()`**: удобный метод сериализации для HTTP-ответов сервера (400 Bad Request):
   ```json
   {
     "name": "ValidationError",
     "message": "user.email: Invalid email",
     "issues": [
       {
         "message": "Invalid email",
         "path": ["user", "email"]
       }
     ]
   }
   ```

---

## 8. Бесшовная интеграция сторонних схем в роутинг

Внутри файлового роутинга Xanto можно комбинировать любые валидаторы:

```ts
import { GET } from '@xanto/core/routing'
import { x } from '@xanto/core/validation'
import * as v from 'valibot'
import { z } from 'zod'

export default GET({
  schema: {
    // Валидация query через Xanto
    query: x.object({
      page: x.number().coerce().default(1),
    }),
    // Валидация headers через Valibot
    headers: v.object({
      authorization: v.string(),
    }),
    // Валидация body через Zod
    body: z.object({
      title: z.string().min(5),
    }),
  },
  handler(ctx) {
    // Все поля строго типизированы в контексте обработчика:
    const page = ctx.query.page       // number
    const auth = ctx.headers.authorization // string
    const title = ctx.body.title      // string
  }
})
```
