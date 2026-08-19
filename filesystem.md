# Xanto.JS — File-based Routing Syntax

## 1. Root Route and Folders (Path Segments)

All routes are constructed relative to the root routing directory (e.g., `routes/` or `api/`).

| Syntax         | Example         | Meaning                                                                 |
| -------------- | --------------- | ----------------------------------------------------------------------- |
| `/`            | `routes/`       | Application root level (`/`)                                            |
| `folder/`      | `users/`        | Static path segment                                                     |
| `[name]`       | `[id]/`         | Dynamic segment (string by default)                                     |
| `[name::type]` | `[id::number]/` | Typed dynamic segment (`number`, `uuid`, `boolean`, etc.)               |
| `[...name]`    | `[...slug]/`    | Named catch-all segment (greedy matching of the remaining path)         |
| `(name)`       | `(admin)/`      | Route group — purely logical, does not affect the final URL             |
| `_name/`       | `_helpers/`     | Private folder — completely ignored by the router                       |

### Folder Structure Constraints:

- **Terminal Catch-all:** A `[...name]` segment can only be the **last** (terminal) segment in the path chain. Nested folders inside a catch-all segment are forbidden and will result in a build error.
- **Catch-all Typing:** The `[...name::type]` modifier is **not supported** (catch-all always captures the raw array of strings / remaining path).

---

## 2. Method Files

| Syntax               | Example                                                | URL Mapping                    |
| -------------------- | ------------------------------------------------------ | ------------------------------ |
| `{method}.ts`        | `get.ts`, `post.ts`, `put.ts`, `delete.ts`, `patch.ts` | Method for the current segment |
| `{name}.{method}.ts` | `user.get.ts`, `create-user.post.ts`                   | Method for the current segment |

- `{name}` — an arbitrary prefix for developer convenience (improves file search in IDEs). It is completely ignored by the framework when building routes.
- **Root URL (`/`):** Handled by method files located directly in the root routing directory (e.g., `routes/get.ts` or `routes/index.get.ts`).

---

## 3. Special and Utility Files

| Syntax                 | Example               | Purpose                                                    |
| ---------------------- | --------------------- | ---------------------------------------------------------- |
| `middleware.ts`        | `middleware.ts`       | Middleware for the current folder and all nested routes    |
| `{name}.middleware.ts` | `auth.middleware.ts`  | Same as above, `{name}` is ignored by the framework        |
| `error.ts`             | `error.ts`            | Error handler for the current folder and all nested routes |
| `{name}.error.ts`      | `validation.error.ts` | Same as above, `{name}` is ignored by the framework        |

### Ignored (Private) Files:

A file is considered **ignored (private)** if its name does not match any of the following patterns:

- `{method}.ts` or `{name}.{method}.ts`
- `middleware.ts` or `{name}.middleware.ts`
- `error.ts` or `{name}.error.ts`

Examples of ignored files: `service.ts`, `types.ts`, `schema.validator.ts`.

### Constraints and Execution Order:

- **One File per Level:** Only one middleware file and one error file are allowed per folder (regardless of the `{name}` prefix). Two files with the `.middleware.ts` suffix (e.g., `auth.middleware.ts` + `log.middleware.ts`) in the same folder cause a **build error**.
- **Middleware Cascade (Top-Down):** The middleware chain executes from the top down (from the root `routes/` to the target endpoint).
- **Error Handler Cascade (Bubble-Up):** Error handling propagates from the bottom up (the error is caught by the nearest ancestor `error.ts` in the tree).

---

## 4. Symbols and Modifiers

| Symbol | Location                        | Meaning                                                |
| ------ | ------------------------------- | ------------------------------------------------------ |
| `[ ]`  | Around segment name             | Dynamic parameter (`[id]`)                             |
| `::`   | Inside `[ ]`                    | Separator for parameter name and type (`[id::number]`) |
| `...`  | Inside `[ ]`, before name       | Catch-all modifier (`[...slug]`)                       |
| `( )`  | Around folder name              | Group with no effect on URL (`(admin)`)                |
| `_`    | At the start of folder name     | Private folder, ignored by router (`_helpers/`)        |
| `.`    | Between name and method in file | Separator for `{name}.{method}.ts`                     |

---

## 5. Matching Priority (Highest to Lowest)

If an incoming URL matches multiple routes at the same tree level, matching is performed in strict order:

1. **Static Segment** (`/users/settings`)
2. **Typed Dynamic Segment** (`/users/[id::number]`)
   - _If the value fails type validation, the router falls back to the next rule in the priority list._
3. **Plain Dynamic Segment** (`/users/[id]`)
4. **Catch-all Segment** (`/users/[...slug]`)

> **Note:** Coexistence of segments with **different priority levels** within the same parent folder is permitted (e.g., `users/settings/`, `users/[id::number]/`, and `users/[...slug]/`). The router automatically organizes them into a cascade according to priority.

---

## 6. Conflicts — All Treated as Build Errors

Any ambiguity in routing is caught during the static analysis phase of tree construction:

- **Duplicate Methods:** Two files for the same HTTP method in the same folder (`get.ts` + `user.get.ts`).
- **Same Priority Level Collisions:**
  - Two different plain dynamic segments at the same level (`[id]` and `[slug]`).
  - Two different typed dynamic segments at the same level (`[id::number]` and `[slug::string]`).
- **Route Group Collisions `(group)`:** Two identical resulting URLs coming from different groups (e.g., `(auth)/login/get.ts` and `(public)/login/get.ts`).
- **Duplicate Parameter Names in Path:** The same parameter name occurring twice in a single path (e.g., `[id]/posts/[id]`).
- **Non-terminal Catch-all:** A folder placed inside a catch-all segment (`[...slug]/subfolder/`).
- **Ambiguous Trailing Slash:** `/users` and `/users/` are registered as the exact same route; attempting to define different behavior for them is an error.

---

## 7. Case Sensitivity

- All URL paths are automatically converted to lower case (`lowercase`) by the framework when building the route tree.
- **Constraint:** On case-insensitive file systems (Windows / macOS), files differing only in casing (e.g., `User.get.ts` and `user.get.ts`) will physically collide on disk prior to being scanned by the framework.

---

## 8. Rejected Features (Deliberately Not Supported in v1)

- Optional segments `[[name]]`
- Multiple parameters in a single path segment (`[width]x[height]`)
- Nameless catch-all `[...]`
- Typed catch-all `[...slug::type]`
- Environment file suffixes (`.dev.ts` / `.prod.ts`)

**Reason for rejection:** Unambiguous static analysis, deterministic matching with zero runtime overhead, and simpler architecture for v1.
