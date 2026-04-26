# Patterns & Pitfalls

> Read when: implementing component logic, making state decisions, adding animations, or any time `useEffect` feels like the answer.

---

## `useEffect` — last resort, not the go-to

`useEffect` is the single largest source of bugs in React codebases. Before reaching for it, exhaust every alternative.

### Legitimate uses

- Synchronising with a truly external system (a non-React library, a WebSocket, a DOM API like `ResizeObserver`).
- Running code that must happen after paint for a specific browser reason.
- Cleaning up a subscription or timer on unmount.

That is the complete list.

### Common misuses — and what to do instead

**Syncing state to state**
```tsx
// ❌ Wrong
useEffect(() => { setFullName(`${first} ${last}`); }, [first, last]);

// ✅ Correct — derive during render
const fullName = `${first} ${last}`;
```

**Fetching data**
```tsx
// ❌ Wrong
useEffect(() => { fetch("/api/user").then(setUser); }, []);

// ✅ Correct — TanStack Query owns all server state
const { data: user } = useQuery(getUserQueryOptions());
```

**Responding to user events**
```tsx
// ❌ Wrong
useEffect(() => { if (submitted) sendForm(data); }, [submitted]);

// ✅ Correct — run logic directly in the handler
function handleSubmit() { sendForm(data); }
```

**Initialising state from props**
```tsx
// ❌ Wrong
useEffect(() => { setInternalValue(prop); }, [prop]);

// ✅ Correct — initialise once, or make the component fully controlled
const [internalValue, setInternalValue] = useState(prop);
```

### Dependency array pitfalls

- Missing dependencies cause stale closure bugs.
- Objects or arrays created inline are new references every render — they will re-trigger the effect on every render. Stabilise with `useMemo` or move them outside the component.
- Never suppress the `exhaustive-deps` warning without fully understanding the consequence.

---

## Derived state — compute, don't store

If a value can be calculated from existing state or props, calculate it during render. Do not store it in `useState`.

```tsx
// ❌ Wrong
const [count, setCount] = useState(0);
useEffect(() => { setCount(items.length); }, [items]);

// ✅ Correct
const count = items.length;
```

For expensive derivations, use `useMemo` — but only when you can measure the cost.

---

## `useMemo` and `useCallback` — measure before optimising

Memoisation has a cost. Wrapping everything "just in case" adds memory overhead and makes code harder to read.

Reach for them only when:
- A computation is genuinely expensive and profiling confirms it.
- A stable reference is required as a dependency for another hook or a child wrapped in `React.memo`.

```tsx
// ❌ Wrong — premature, no measurable benefit
const label = useMemo(() => `${first} ${last}`, [first, last]);

// ✅ Correct — plain derivation
const label = `${first} ${last}`;
```

---

## Unstable references as props

Objects and arrays created inline in JSX are new references on every render. Passing them as props to memoised children or as hook dependencies defeats memoisation silently.

```tsx
// ❌ Wrong
<Component style={{ color: "red" }} filters={["a", "b"]} />

// ✅ Correct — stable references
const style = { color: "red" };
const filters = ["a", "b"];
```

---

## Refs — two uses only

`useRef` is for: holding a reference to a DOM node, and holding a mutable value that must not trigger a re-render (timer ID, previous value). Never read a ref during render — it may not be attached yet.

```tsx
// ❌ Wrong — ref value won't trigger re-render; UI goes stale
const count = useRef(0);

// ✅ Correct — if the value affects rendered output, use useState
const [count, setCount] = useState(0);
```

---

## Server state — TanStack Query owns it

Never copy query data into `useState`. Copying creates two sources of truth that immediately drift.

```tsx
// ❌ Wrong
const { data } = useQuery(getUserQueryOptions());
const [user, setUser] = useState(data);

// ✅ Correct
const { data: user } = useQuery(getUserQueryOptions());
```

---

## Prop drilling — know when to stop

Passing props through more than two component levels is a signal state is in the wrong place.

- Siblings need it → lift to nearest common parent.
- Parts of a Compound Component need it → React Context scoped to that component file.
- Distant features need it → move to the owning feature's TanStack Store.

---

## Logic in JSX

JSX is for structure. Logic belongs in variables, functions, or hooks.

```tsx
// ❌ Wrong
return (
  <div>
    {items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name)).map(i => (
      <Item key={i.id} item={i} />
    ))}
  </div>
);

// ✅ Correct
const visibleItems = items
  .filter(i => i.active)
  .sort((a, b) => a.name.localeCompare(b.name));

return (
  <div>
    {visibleItems.map(i => <Item key={i.id} item={i} />)}
  </div>
);
```

---

## List keys — never use index

```tsx
// ❌ Wrong — causes reconciliation bugs on reorder/add/remove
{items.map((item, index) => <Item key={index} item={item} />)}

// ✅ Correct
{items.map(item => <Item key={item.id} item={item} />)}
```

Index as key is acceptable only for static lists that are never reordered and never have items added or removed.

---

## Animations

### GSAP vs Framer Motion

| Use case | Tool |
|---|---|
| Simple transitions, layout animations, mount/unmount presence | Framer Motion |
| Complex sequenced animations, scroll-driven effects, timeline control | GSAP |
| SVG path animation, morphing, stagger sequences | GSAP |
| Shared layout transitions between routes or components | Framer Motion |

### GSAP in React — mandatory rules

Always use `useGSAP` from `@gsap/react`. Never use `useEffect` to run GSAP animations.

```tsx
// ❌ Wrong
useEffect(() => { gsap.to(".box", { x: 100 }); }, []);

// ✅ Correct
useGSAP(() => { gsap.to(boxRef.current, { x: 100 }); }, { scope: containerRef });
```

- Always pass a `scope` ref so selectors are scoped to the component.
- Prefer `refs` over class selectors for targeting elements.
- `useGSAP` handles context and cleanup automatically when used correctly.

### Animate transform, not layout properties

Animating `width`, `height`, `top`, `left`, or `margin` triggers layout recalculation every frame. Always animate `transform` and `opacity`.

```tsx
// ❌ Wrong — causes layout thrash
gsap.to(el, { width: 200, top: 50 });

// ✅ Correct — GPU composited
gsap.to(el, { x: 50, scaleX: 1.5 });
```

### Framer Motion rules

- Use the `layout` prop to animate layout changes — do not manually animate `width`, `height`, or position.
- Wrap conditionally rendered components in `<AnimatePresence>` to animate mount/unmount.
- Define variants outside the component — never inline animation objects in JSX.

```tsx
// ❌ Wrong — new object reference every render
<motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} />

// ✅ Correct
const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};
<motion.div variants={variants} initial="hidden" animate="visible" />
```
