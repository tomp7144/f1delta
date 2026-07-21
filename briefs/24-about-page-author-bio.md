# Brief 24 — About page + author bio

**Purpose:** Publish a real About page and a reusable author bio — the fastest, highest-signal E-E-A-T move for the AdSense re-review. A genuine, named person with a real racing life behind the site is the single clearest "not a content farm" signal. **No code logic, no data — this is content placement.** No f1δ dependency (unlike the methodology page).

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ
- Does an `/about` page already exist (a stub to replace)? Report its current state and route.
- Nav structure — is "About" linked (footer already shows About/Contact/Privacy/Terms)? Confirm where it points.
- Where a **byline / author** element will live for future `/stories` pieces — so the bio has a home to link to. Report whether an author page (`/author/tom-payment`) is worth creating now or folding into `/about`. (Recommend: `/about` doubles as the author page for a solo project; story bylines link to it.)

---

## Step 1 — About page content

Place at `/about` (replace the stub). Byline: **Tom Payment**. Final copy:

---

**Racing was the family thing long before Formula 1 was mine.**

Growing up, Sundays meant the local Sands Speedway — my uncle out on track, my dad on his pit crew, both of them race fans right down to the bone. Dad ran off-road trucks himself a time or two, but mostly he was a pit-crew guy, and some of my favorite memories anywhere are the Bark River off-road races we'd go to together nearly every summer, always right around my birthday.

So I came to racing honestly, even if I came to Formula 1 late. For years it was NASCAR — a die-hard Jeff Gordon fan through the '90s and 2000s, and later Jimmie Johnson, mostly because Gordon co-owned the team.

F1 didn't grab me until the 2021 offseason. I'll own it: Drive to Survive pulled me in, right as the Verstappen–Hamilton title fight was tearing itself apart. But once I was in, I was *all* in — and the first thing I realized was how much I'd missed. Decades of it.

So I started working backward, rewatching old seasons on F1TV, and I kept slamming into the same wall: there was nowhere to just *see it all*. I'd have five browser tabs open trying to line up two drivers' careers. I'd catch some detail and have no way to chase it — wait, they had the same race engineer? Rosberg raced against *both* Hamilton and Schumacher? Alonso sat out 2002 completely? Every one of those was a rabbit hole I wanted to fall into, and nothing would let me.

F1 Delta is the site I went looking for and couldn't find. What makes it different is simple: everything F1 has, in one place, easy to actually understand — and built so you can get lost in it. Start on a driver and follow the threads: teammates, race engineers, circuits, team principals, Grands Prix, whole seasons, careers side by side. The connections are the point — the ones you'd never stumble on with ten tabs open — and the whole thing stays uncluttered and easy to move through while you find them.

I'm still catching up on the seasons I missed. This is me building the map as I go.

— Tom Payment

---

## Step 2 — Author bio (reusable snippet)

Short form, for story byline boxes / the author area:

> *Tom Payment is a lifelong racing fan who grew up at his local short track — uncle on the wheel, dad on the pit crew — and came to Formula 1 in 2021, during the Verstappen–Hamilton showdown. He built F1 Delta as the all-in-one, deeply connected F1 reference he went looking for and couldn't find.*

Store it where it can be reused (a small partial/component), so every `/stories` piece can drop it into a byline box that links to `/about`.

*(Placeholder to fill: one specific expertise beat — the season/driver Tom's gone deepest on since 2021 — to add a note of real F1 depth to the bio. Tom to provide; edit in.)*

---

## Step 3 — Placement details
- `/about` reachable from nav/footer (already linked — confirm it points to the new page).
- If worth it (Step 0), create `/author/tom-payment` as an alias/author page reusing the bio; otherwise `/about` is the canonical author page.
- **Search (S1):** index `/about` (and author page if created) in `derive-search.mjs` so it's findable. Minor, but per convention new pages get indexed.
- Sitemap: static, auto-picked-up by `@astrojs/sitemap`.

---

## Step 4 — Verify
- `/about` renders the final copy, byline present, reads clean on mobile.
- Nav/footer link resolves to it.
- Bio snippet stored reusably for future story bylines.

## Step 5 — Commit (scoped)
`git add` the about page file, the bio partial, nav/footer if touched, `derive-search.mjs` + `search-index.json` if indexed. Named paths, not `-A`.
Commit: `Brief 24: About page + author bio (Tom Payment)`. Not pushed — Tom reviews + pushes.

---

## Definition of done
- [ ] `/about` live with final copy + Tom Payment byline; mobile-clean.
- [ ] Reusable bio snippet stored for story bylines.
- [ ] Linked from nav/footer; indexed in search.
- [ ] Scoped commit; not pushed.

---

**Next:** Brief 25 (refine f1δ to per-race in code) → Brief 26 (methodology page). And in parallel, the first `/stories` piece — the 2016 season — which is an interview-and-edit: Tom answers, Claude drafts, Tom's voice throughout.
