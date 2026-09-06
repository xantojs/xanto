# Xanto.JS — Validation System (x.*)

The `@xanto/core/validation` module provides a lightweight, blazing-fast, and strictly typed validation system designed for HTTP request payloads, query parameters, headers, and general business logic.

The system is built on top of the open **Standard Schema v1** specification, guaranteeing 100% seamless interoperability across the TypeScript ecosystem (Valibot, Zod 3.24+, ArkType, TypeBox).

---

## 1. Core Principles

1. **Unified `x` Namespace:** All schema builders are accessible via the concise `x` object (`x.string()`, `x.number()`, `x.object()`).
2. **Immutable Chaining:** Every modifier method (`.min()`, `.max()`, `.optional()`) returns a brand new independent schema instance without mutating the base one.
3. **Type-level Chain Guards:** TypeScript strictly prohibits invalid or conflicting method chains at compile time.
4. **Universal `parse` / `safeParse` Runners:** Capable of validating native `x.*` schemas as well as third-party schemas from Valibot, Zod, and any other Standard Schema compliant library.

---

## 2. Type Safety and Chain Guards

Xanto's type system dynamically narrows available chaining methods as they are invoked:

### Preventing Conflicting Method Chains:
* **String Formats:** Calling `.email()` removes subsequent `.email()`, `.url()`, and `.uuid()` calls from autocompletion.
* **Fixed Length:** Calling `.length(5)` removes `.min()` and `.max()` since they become redundant.
* **Object Modes:** Calling `.strict()` removes `.strict()`, `.passthrough()`, and `.strip()`.
* **Single Coercion:** `.coerce()` is excluded from autocompletion once applied.

```ts
x.string().email().email()   // ❌ TypeScript Error: 'email' does not exist on type
x.string().length(5).min(2)  // ❌ TypeScript Error: 'min' does not exist on type
x.object({}).strict().strict() // ❌ TypeScript Error
```

### Accurate Type Inference:
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

## 3. Primitive Types

| Builder | Chaining Methods | Description and Custom Messages |
| :--- | :--- | :--- |
| `x.string(msg?)` | `.min(n, msg?)`<br>`.max(n, msg?)`<br>`.length(n, msg?)`<br>`.email(msg?)`<br>`.url(msg?)`<br>`.uuid(msg?)`<br>`.regex(RegExp, msg?)` | String type with length and format constraints. Accepts optional custom error message `msg` |
| `x.number(msg?)` | `.min(n, msg?)`<br>`.max(n, msg?)`<br>`.integer(msg?)`<br>`.coerce()` | Number type. `.coerce()` casts numerical strings (`'42'` ➔ `42`) |
| `x.boolean(msg?)` | `.coerce()` | Boolean type. `.coerce()` parses `'true'`, `'false'`, `1`, `0` |
| `x.date(msg?)` | `.min(Date, msg?)`<br>`.max(Date, msg?)`<br>`.coerce()` | `Date` instance. `.coerce()` parses ISO date strings and timestamps |
| `x.literal(val, msg?)` | — | Exact literal value matching (`x.literal('admin')`, `x.literal(404)`) |
| `x.enum(values, msg?)` | — | String enum values (`x.enum(['asc', 'desc'])`) |
| `x.any()` | — | Any value (`any`) |
| `x.unknown()` | — | Unknown value (`unknown`) |

---

## 4. Complex Types and Data Structures

### `x.object(shape, msg?)`
Defines an object schema:

```ts
import { x } from '@xanto/core/validation'

const userSchema = x.object({
  id: x.string().uuid('ID must be a valid UUID'),
  name: x.string().min(2, 'Name is too short'),
  age: x.number().coerce().min(18).optional(),
  role: x.enum(['admin', 'user']).default('user'),
})
```

**Unrecognized Key Modes:**
* **`strip` (default):** Automatically strips unknown keys from the parsed output.
* **`.passthrough()`:** Retains unknown keys in the output object.
* **`.strict(msg?)`:** Fails validation if extra keys are present, reporting the exact key path (`path: ['extraField']`).

### `x.array(elementSchema, msg?)`
* `.min(n, msg?)` — Minimum array length
* `.max(n, msg?)` — Maximum array length
* `.length(n, msg?)` — Exact array length

### `x.tuple(items, msg?)`
Tuple with fixed positional types:
```ts
const point = x.tuple([x.number(), x.number()])
```

### `x.record(keySchema, valueSchema, msg?)`
Record dictionary with dynamic keys:
```ts
const permissions = x.record(x.string(), x.array(x.string()))
```

---

## 5. Logic, Transformations, and Pipelines

| Builder | Example | Description |
| :--- | :--- | :--- |
| `x.union([a, b], msg?)` | `x.union([x.string(), x.number()])` | Union of schemas (OR) |
| `x.nullable(schema)` | `x.nullable(x.string())` | Allows `null` |
| `.optional()` | `x.string().optional()` | Allows `undefined` |
| `.default(val)` | `x.boolean().default(true)` | Replaces `undefined` with fallback value |
| `x.transform(schema, fn)` | `x.transform(x.string(), s => s.trim())` | Output transformation |
| `x.pipe(schema, ...actions)` | `x.pipe(x.string(), trim())` | Pipeline validation steps |

---

## 6. Validation Execution (`parse` / `safeParse`)

The `parse()` and `safeParse()` utility functions are **universal Standard Schema runners**: they accept `x.*` schemas, Valibot schemas (`v.*`), Zod schemas (`z.*`), or ArkType instances.

### `parse(schema, data)`
Asynchronously validates data. Throws a `ValidationError` on failure.

```ts
import { parse, x } from '@xanto/core/validation'
import * as v from 'valibot'

// Parsing native x.* schema
const data1 = await parse(x.string().min(3), 'hello')

// Parsing third-party Valibot schema directly with Xanto runner!
const data2 = await parse(v.string(), 'valid string')

// Throws ValidationError with detailed message and issues
await parse(v.number(), 'not a number')
```

### `safeParse(schema, data)`
Non-throwing validation returning a Discriminated Union:

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

## 7. Error Handling (`ValidationError`)

When validation fails, `parse()` throws an instance of `ValidationError`.

### Formatted Message `error.message`
Provides a human-readable aggregate summary with path prefixes:
```ts
// "user.email: Invalid email; items[0].price: Must be positive"
console.log(error.message)
```

### Methods and Properties:
1. **`error.issues`** (`readonly StandardIssue[]`): Raw list of standard issue objects adhering to Standard Schema specification.
2. **`error.getIssuesForPath(path)`**: Filters issues for a specific key or nested path:
   ```ts
   error.getIssuesForPath('user.email')
   error.getIssuesForPath(['items', 0, 'price'])
   ```
3. **`error.flatten()`**: Groups issues into a clean format tailored for forms and frontend UI:
   ```ts
   const { formErrors, fieldErrors } = error.flatten()
   // formErrors: ['Invalid request payload']
   // fieldErrors: {
   //   'user.email': ['Invalid email format', 'Email already taken'],
   //   'user.age': ['Must be at least 18']
   // }
   ```
4. **`error.toJSON()`**: Clean serialization helper for HTTP responses (400 Bad Request):
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

## 8. Seamless Third-Party Schema Integration in Routes

Within Xanto's file-based routing, you can mix and match any validation libraries without adapters:

```ts
import { GET } from '@xanto/core/routing'
import { x } from '@xanto/core/validation'
import * as v from 'valibot'
import { z } from 'zod'

export default GET({
  schema: {
    // Validated via Xanto
    query: x.object({
      page: x.number().coerce().default(1),
    }),
    // Validated via Valibot
    headers: v.object({
      authorization: v.string(),
    }),
    // Validated via Zod
    body: z.object({
      title: z.string().min(5),
    }),
  },
  handler(ctx) {
    // All parameters are strictly typed within the handler context:
    const page = ctx.query.page       // number
    const auth = ctx.headers.authorization // string
    const title = ctx.body.title      // string
  }
})
```
