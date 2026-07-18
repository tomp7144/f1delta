# Brief 22 — Housekeeping: ads.txt + bake workflow fix

**Purpose:** Two small, independent fixes — **(A)** add `ads.txt` so AdSense stops reporting "Not found," and **(B)** fix the failing "Bake latest race" workflow (exit code 9). Separate commits; the bake fix is a standalone workflow file that can be pushed on its own to restore data refresh.

**Push status:** Cody commits each part (scoped, separate). Tom reviews + pushes. **The bake fix (`bake-latest.yml` only) can be pushed independently and immediately** to unstick the data bake — it doesn't have to wait on the unpushed 13–21 stack.

**Numbering:** this is Brief 22. The optional DNF% / points-finish% / bestFinish derive stays the last open optional item (unnumbered until written).

---

## Part A — `ads.txt` (AdSense "Not found" → Authorized)

### A0 — Read
Grep the repo for the AdSense **publisher ID** — it's already in the AdSense script/config as **`ca-pub-XXXXXXXXXXXXXXXX`** (search `ca-pub-`). Report it.

### A1 — Create `public/ads.txt`
One line, plain text:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```
- **CRITICAL — drop the `ca-`.** `ads.txt` uses `pub-XXXX`, but the script stores it as `ca-pub-XXXX`. Take the digits and write `pub-XXXX`. This mismatch is the #1 reason ads.txt stays "Not found" after being added.
- `f08c47fec0942fa0` is Google's fixed certification-authority ID — same for every publisher, verbatim.
- Plain text only. No HTML, no BOM, no trailing lines. `public/ads.txt` serves at `https://f1delta.com/ads.txt`.

### A2 — Verify (Tom's live check after deploy)
Load `https://f1delta.com/ads.txt` in a browser. It **must return the raw plain-text line** — not a redirect, not an HTML page. **Cloudflare** sits in front of the origin and a proxy/redirect rule can intercept `/ads.txt` and serve something else, which keeps AdSense stuck on "Not found" even though the file exists. If it doesn't serve raw, add a Cloudflare bypass/page rule for `/ads.txt`. Once it serves clean, Google re-crawls and flips the status within a day or two (no action needed after that).

### A3 — Commit
`git add public/ads.txt` → `Brief 22A: add ads.txt for AdSense`.

---

## Part B — Bake workflow fix ("exit code 9")

### B0 — Read (pull the exact error)
1. For the failed run (**#227**, or the latest failed bake): read the line **directly above** `Process completed with exit code 9` — via the UI (expand the failed `bake` step) or `gh run view <run-id> --log-failed` (`gh run list --workflow=bake-latest.yml` gets the run ID). Exit 9 = Node **"unknown option"** — that line **names the removed/invalid flag**. Report it verbatim.
2. Read `.github/workflows/bake-latest.yml`: the `setup-node` step (what `node-version` it pins, **if any**) and the exact bake command (the `node …` invocation + its flags). Report both.

### B1 — Diagnosis (expected)
The runner's Node moved out from under the job — **Node 20 was deprecated on GitHub runners and forced to 24** (that's the separate warning in the annotations). The bake command passes a flag Node 24 no longer recognizes → exit 9. Many experimental flags were stabilized and the flag dropped (JSON modules, specifier resolution, etc.). The B0 line names the exact one. *(This is failing on the current `main`, so it is not the Astro 6 upgrade in the unpushed pile — it's the runner Node.)*

### B2 — Fix
- **Pin the Node version** in `setup-node`: `node-version: '22'` — matches `netlify.toml`'s `NODE_VERSION = "22"`, so the bake and the build run the **same** Node and the runner default can't drift again. This alone addresses the "why now."
- **Resolve the flag** the log named (B0): if it's a removed flag, drop it, or replace it with its Node 22 form (a stabilized feature usually just needs the flag removed). Apply per what the log actually shows — don't guess a flag the log didn't name.
- *(Optional, not required: the Node-20 deprecation **warning** on `checkout@v4` / `setup-node@v4` is cosmetic, not the failure. Bumping those to `@v5` later clears it.)*

### B3 — Verify
"Re-run jobs" on the workflow → confirm **green** (bake completes and commits fresh data).

### B4 — Commit
`git add .github/workflows/bake-latest.yml` → `Brief 22B: fix bake workflow (pin Node 22, resolve removed flag)`. **Self-contained — pushable on its own to restore the bake immediately**, independent of the 13–21 stack.

---

## Definition of done
- [ ] `public/ads.txt` present, `pub-` (not `ca-pub-`) format, serving **raw** at the root (verified past Cloudflare).
- [ ] Bake: exact bad flag identified from the log; Node pinned to `22`; flag resolved; re-run is green.
- [ ] Two separate scoped commits; bake fix pushable independently.
