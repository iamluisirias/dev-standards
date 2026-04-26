# Data & Validation

> Read when: working with TypeScript types, Valibot schemas, forms, API data, or error handling.

---

## TypeScript rules

| Rule | Detail |
|---|---|
| `any` | Forbidden as a variable, prop, or return type. Only permitted as a bound in a generic: `<T extends Record<string, any>>`. Escalate to a human if needed elsewhere. |
| `as` casting | Forbidden except for external library types that are provably wrong. |
| `interface` | Reserved for component prop definitions only. |
| `type` | Used for everything else: object shapes, API responses, store state, unions, intersections. |
| Inference | Let TypeScript infer where the type is obvious. No redundant annotations. |

---

## API response types — schema first, always

Define the Valibot schema first. Infer the TypeScript type from it using `InferOutput`. This keeps type and runtime validation permanently in sync.

```ts
// schemas/vehicle.schema.ts
import { object, string, number, pipe, url } from "valibot";
import type { InferOutput } from "valibot";

export const vehicleSchema = object({
  id: string(),
  plate: string(),
  year: number(),
  imageUrl: pipe(string(), url()),
});

// types/vehicle.type.ts
import type { InferOutput } from "valibot";
import { vehicleSchema } from "@/features/vehicles/schemas/vehicle.schema";

export type Vehicle = InferOutput<typeof vehicleSchema>;
```

**Rules:**
- Schema lives in `schemas/[name].schema.ts`. Type lives in `types/[name].type.ts`.
- Never write a `type` for an API response without a corresponding Valibot schema.
- Validate at the boundary — parse API responses in the service layer before returning data to the query.
- Never pass raw, unvalidated API data into the rest of the app. If the shape is wrong, the parse throws — that is correct behaviour.

```ts
// services/vehicle.service.ts
async function getVehicle(params: GetVehicleParams): Promise<Vehicle> {
  const { data } = await axiosBasic.get("/vehiculos", { params });
  return parse(vehicleSchema, data); // throws if shape is wrong
}
```

---

## Validation (Valibot)

Valibot is the only validation library. Do not use Zod or Yup.

- Use `.check()` for all custom validation logic. **Never use `.refine()`.**
  - Why: `.refine()` bypasses Valibot's type inference chain and creates runtime overhead. `.check()` is the type-safe equivalent. If `.check()` cannot express the logic, escalate to a human.
- Write all validation error messages as **namespaced key identifiers**, not freeform prose. This makes the future migration to i18next mechanical.

```ts
// ❌ Wrong — freeform prose, hard to migrate
{ message: "This field is required" }

// ✅ Correct — structured key, mechanical to migrate
{ message: "validation.required.field" }
{ message: "validation.vehicle.plate.invalid" }
```

---

## Form management

**TanStack Form** is the standard for all new features. Use it for all form logic and validation integration.

Do not use React Hook Form for new features. Do not migrate existing React Hook Form forms unless explicitly scoped to a migration task.

---

## Error handling hierarchy

Errors flow through a defined hierarchy. Each layer owns one responsibility.

```
Axios interceptor
  → Catches HTTP errors
  → Normalises them into a typed error object
  → Throws the normalised error

TanStack Query
  → Propagates the thrown error via query error state
  → Never swallows or transforms errors

Component layer
  → Fatal / unrecoverable errors    → React Error Boundary (full fallback UI)
  → Recoverable errors (user retry) → Toast notification
  → Field-specific errors           → Inline, below the field
```

### Decision rule for UI

| Situation | Pattern |
|---|---|
| User cannot continue without resolving the error | Error Boundary |
| User can retry or dismiss and continue | Toast |
| Error is specific to a field or input | Inline |

This hierarchy connects directly to the UI contracts in `.claude/when/ui-library.md`.
