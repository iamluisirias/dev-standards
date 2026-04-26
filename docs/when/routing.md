# Routing

> Read when: creating or modifying a route file, adding loaders, working with search params, or structuring nested routes.

---

## Setup

**TanStack Router** in file-based mode. Route files live under `src/routes/` and mirror the URL structure exactly. The router generates type-safe route definitions from the file tree — do not write route definitions by hand.

---

## File vs folder — the structural rule

**Flat files for standalone (leaf) routes. Folders for grouped or nested routes.**

The decision is driven by whether a route segment has children — not by preference.

```
src/routes/
  __root.tsx                              → root layout, providers, global error boundary
  index.tsx                               → /
  about.tsx                               → /about (leaf, no children)
  cotizar/
    index.tsx                             → /cotizar
    $slug-product-category/
      index.tsx                           → /cotizar/:slugProductCategory
      confirmation.tsx                    → /cotizar/:slugProductCategory/confirmation
  seguro-vehiculo/
    index.tsx                             → /seguro-vehiculo
    $vehiculo-id.tsx                      → /seguro-vehiculo/:vehiculoId (leaf param, no children)
```

**Use a folder when:**
- The segment has 2+ child routes.
- A dynamic param (`$slug`) has at least one child route.
- The group shares a layout wrapper.

**Use a flat file when:**
- The route is a leaf with no children and will not gain them.
- A dynamic param route where the param has no subroutes.

**Never use dot-notation** (`cotizar.$slug-product-category.tsx`) — it produces the same result but obscures hierarchy. Folders are always readable at a glance.

---

## Shared layouts

When subroutes share a common layout, use a **pathless layout route** — a file prefixed with `_` that renders `<Outlet />` without adding a URL segment.

```
src/routes/
  cotizar/
    _layout.tsx          → shared layout (no URL segment)
    index.tsx            → /cotizar
    $slug-product-category/
      index.tsx          → /cotizar/:slugProductCategory
      confirmation.tsx   → /cotizar/:slugProductCategory/confirmation
```

```tsx
// src/routes/cotizar/_layout.tsx
export const Route = createFileRoute("/cotizar/_layout")({
  component: CotizarLayout,
});

function CotizarLayout() {
  return (
    <div className="cotizar-shell">
      <CotizarProgressBar />
      <Outlet />
    </div>
  );
}
```

**Rules:**
- Create a layout route only when 2+ sibling routes genuinely share UI or behaviour.
- The layout component must render `<Outlet />`.
- Layout routes own structure only — no data-fetching, no business logic.
- If only one route in a group needs a wrapper, put the wrapper inside that route's page component.

---

## Page component pattern

The page component lives in the route file, defined as a named function.

- **Naming:** `[DescriptiveName]Page` — match the route's intent, not the URL segment. `ProductCategoryPage`, not `SlugProductCategoryPage`.
- **The page is a composition root.** It imports feature components, hooks, and stores directly from their source files using `@/`. It must not contain business logic, data-fetching, or local state.

```tsx
// src/routes/cotizar/$slug-product-category/index.tsx
export const Route = createFileRoute("/cotizar/$slugProductCategory/")({
  component: ProductCategoryPage,
  validateSearch: productCategorySearchSchema,
});

function ProductCategoryPage() {
  return (
    <main className="max-lg:mt-6 mb-10 lg:mb-16 space-y-4 lg:space-y-12">
      <Stepper />
      <StepStrategyComponent />
      <BlacklistVerificationDialog />
    </main>
  );
}
```

---

## `validateSearch` schema ownership

The `validateSearch` schema is defined and exported from the route file — it is the source of truth for search params. Features that need the search params type import the schema from the route file, not from the feature.

```ts
// src/features/quotes/hooks/use-quote-search.hook.ts
import { productCategorySearchSchema } from "@/routes/cotizar/$slug-product-category/index";
```

---

## Loaders

Route loaders call `queryClient.ensureQueryData()` using the feature's `queryOptions`. They never fetch directly.

```ts
beforeLoad: async ({ context, params: { slugProductCategory } }) => {
  await context.queryClient.ensureQueryData(
    getProductCategoryBySlugQueryOptions(slugProductCategory),
  );
},
```

---

## Code splitting

TanStack Router's file-based mode already code-splits every route automatically — each route file becomes its own chunk loaded only when visited. Manual lazy loading of the page component itself is unnecessary.

Use `lazy()` only when a **specific component inside the page** pulls in a heavy third-party library (chart renderer, PDF viewer, rich text editor) that would bloat the route chunk. Split that component alone, not the page:

```tsx
const HeavyChart = lazy(async () => {
  const { HeavyChart } = await import("@/features/analytics/components/heavy-chart.component");
  return { default: HeavyChart };
});

function AnalyticsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </main>
  );
}
```

Reach for `lazy()` only when you can measure a meaningful bundle impact from a specific dependency. It is a targeted optimisation, not a default pattern.
