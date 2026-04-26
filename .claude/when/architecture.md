# Architecture

> Read when: creating or modifying a feature, adding a service, query, or store, or deciding where a file belongs.

---

## Screaming Architecture

The folder structure must make the app's domain instantly readable to a newcomer without opening any file. Every meaningful unit of functionality is a self-contained folder under `src/features/`.

---

## Feature folder decision table

| Folder | Purpose | Create when… |
|---|---|---|
| `components/` | UI pieces (Compound/Lego pattern) | The feature owns at least one rendered element |
| `constants/` | Enums, static configs, fixed data | Magic values exist that need a name |
| `hooks/` | Feature-specific logic and state | Logic is reused across 2+ components, or is too complex for inline use |
| `lib/` | Configured third-party adapters | A library needs a configured instance before it can be used |
| `queries/` | TanStack Query `queryOptions` definitions | The feature fetches async data |
| `schemas/` | Valibot validation schemas | User input or external data needs validation |
| `services/` | Raw API call functions | The feature communicates with an external API |
| `stores/` | Feature-scoped TanStack Store state | State is too complex for `useState` but does not need to be shared globally |
| `types/` | TypeScript type definitions | Types are shared across more than one file in the feature |
| `tests/` | Test files | Any file in the feature has tests |

---

## Hard boundaries between layers

### `lib/` vs `services/`

- **`services/`** owns the fetch logic. Calls the configured HTTP client, returns typed data. Nothing in `services/` knows about TanStack Query.
- **`lib/`** owns the configured adapter. Creates and exports the tool `services/` uses.

```
services/vehicle.service.ts   → calls axiosBasic.get("/vehiculos", ...)
lib/axios.lib.ts              → creates and exports the axiosBasic instance
```

A service imports from `lib/`. `lib/` never imports from `services/`.

### `queries/` vs `services/`

- **`services/`** is a plain async function. Fetches and returns data. No TanStack Query awareness.
- **`queries/`** wraps a service call inside `queryOptions()`. Owns the `queryKey` and `queryFn`. Never fetches directly.

```ts
// services/vehicle.service.ts
async function getVehicle(params: GetVehicleParams) {
  const { data } = await axiosBasic.get<ApiResponse<GetVehicleResponseData>>("/vehiculos", { params });
  return data;
}

// queries/vehicle.query.ts
function getVehicleQueryOptions(params: GetVehicleParams) {
  return queryOptions({
    queryKey: ["getVehicle", params],
    queryFn: () => getVehicle(params),
  });
}
```

---

## State management tiers

Choose the lowest tier that satisfies the requirement.

| Tier | Tool | When to use |
|---|---|---|
| Local | `useState` | State is strictly contained within a single component |
| Scoped | React Context | Shared state between parts of a Compound Component — never exported outside the file |
| Feature / Global | TanStack Store | State shared across components or features |
| Server | TanStack Query | All async data — single source of truth for anything fetched from an API |

> **Zustand** is not used in new features. TanStack Store is the current standard. Do not migrate existing Zustand stores unless the task explicitly scopes it.

---

## Cross-feature state ownership

Global state lives inside the feature that semantically owns it (`src/features/[owner]/stores/`). Other features import directly from that file using `@/`. There is no root-level `src/stores/` folder.

---

## Cross-feature imports

No barrel files. Import directly from the exact file:

```ts
import { BlacklistVerificationDialog } from "@/features/blacklist/components/blacklist-verification-dialog.component";
import { getProductCategoryBySlugQueryOptions } from "@/features/products/queries/products.query";
import { useQuoteStore } from "@/features/quotes/stores/quote.store";
import { STEP_CODES } from "@/features/steps/constants/steps.constant";
```

If a file moves, the import breaks loudly — that is correct behaviour. Never create an `index.ts` to smooth that over.
