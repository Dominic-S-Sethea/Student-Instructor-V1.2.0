# Cost Model — Per-Active-User LLM Cost (docs/cost-model)

Parameterized spreadsheet + notebook that estimates **LLM cost per active user per month** for the CDES Student Instructor platform, using provider pricing for **cached vs uncached tokens** (OpenAI, Anthropic, and Google prompt/context caching).

## What it computes

For each active user per month:

```
cost_per_user_month = R * [ cost_per_call ]
cost_per_call       = input_cost(h) + output_cost
```

with input cost as a function of cache hit rate `h`:

```
input_cost(h) = [ h*C*CI + (1-h)*C*IW + Rpt*II ] / 1e6
```

- `C`       = cacheable prefix tokens per request (system prompt + KB/RAG context)
- `Rpt`     = non-cacheable remainder tokens (conversation history + current message)
- `II`      = uncached input price per 1M tokens
- `CI`      = cached input price per 1M tokens = `II * cache_hit_mult`
- `IW`      = cache-write price per 1M tokens = `II * write_mul`
- `h`       = cache hit rate applied to the cacheable prefix `C`
- `R`       = AI requests per active user per month
- output_cost = `O * followup_out_mult * CO / 1e6` (main response + follow-up generation)

The same formula applies per provider; only the price table changes.

## Where the results are

| File | Purpose |
|------|---------|
| `parameters.yaml` | Every tunable input (request volume, token counts, prices, scenarios). Edit here, re-run to regenerate. |
| `cost_model.ipynb` | Parameterized notebook: computes the curves and plots cost vs cache hit rate for 10% / 50% / 90% (+ 30% / 70%). |
| `cost_model.xlsx` | Spreadsheet with the same model, input tables, results tables, and a chart. |
| `results.json`   | Machine-readable output of the latest run (rebuild on re-run). |

Cost curves are shown for the three providers at **10%, 50%, 90%** cache hit rates (plus 30/70 in the notebook for a smoother curve).

## How to update the inputs

1. **Edit `parameters.yaml`** (it is self-documenting):
   - `requests_per_user_month` — number of AI calls per active user per month.
   - Token counts (`cacheable_prefix_tokens`, `non_cacheable_remainder_tokens`, `output_tokens`, `followup_out_mult`) — derived from the chat agent architecture (see *Assumptions*).
   - `cache_rates` — hit-rate scenarios to chart.
   - Provider rows `input`/`output`/`write_mul`/`cache_hit_mult` — change any provider's pricing.
   - Optional: `google_context_cache_storage_per_1m_per_hour_usd` for Google per-hour context-cache storage.
2. **Re-run** `cost_model.ipynb` (or open `cost_model.xlsx`) to regenerate `results.json`, the tables, and the chart.

## Provider pricing used (defaults)

| Provider | Input ($/1M) | Cached input | Cache write | Output ($/1M) | Cache-hit multiplier |
|----------|--------------|--------------|-------------|----------------|----------------------|
| OpenAI gpt-4o | 2.50 | 1.25 | 3.125 (1.25×) | 10.00 | 0.5 |
| Anthropic Claude 3.5 Sonnet | 3.00 | 0.30 | 3.75 (1.25×) | 15.00 | 0.1 |
| Google Gemini 2.0/1.5-flash | 0.30 | 0.03 | 0.375 (1.25×) | 2.50 | 0.1 |

Sources: OpenAI prompt caching docs (`developers.openai.com/api/docs/guides/prompt-caching`), Anthropic prompt caching docs (`platform.claude.com/docs/en/build-with-claude/prompt-caching`), Google Gemini API pricing (`ai.google.dev/gemini-api/docs/pricing`). Cache-hit multipliers quoted: OpenAI 0.5×, Anthropic 0.1×, Google context cache ≈0.1×. **Update these prices whenever providers change their rate cards** — the model is purely parametric.

## Model outputs (default run)

At `R=60` requests/user/month, `C=1800`, `Rpt=1400`, `O=600`, `FU=0.15×O`:

| Provider | 10% hit | 50% hit | 90% hit | per-call savings @90% |
|----------|---------|---------|---------|-----------------------|
| OpenAI gpt-4o | $0.5813 | $0.5003 | $0.4193 | 28% |
| Anthropic Claude | $0.7007 | $0.5517 | $0.4027 | 43% |
| Google Gemini | $0.0755 | $0.0606 | $0.0457 | 40% |

Savings are `cost(h=0.10) - cost(h=0.90)`. Note: OpenAI has **no** separate 0.1× "subsequent read" price — its cached input is a flat 0.5× and a 1.25× write, which is why its curve is gentler than Anthropic/Google.

## Assumptions

1. **Request volume (60/user/month)** — measured, not hard-coded anywhere yet. Derive from actual AI-agent request counts in `metrics.ts` / usage tables once Phase-4 observability is wired; this number is fully parametric.
2. **Token counts** — from the agent's own construction: the chat assembles a system prompt + 3 RAG sources + a 6-turn conversation window in every call. `C=1800` ≈ system prompt + KB context; `Rpt=1400` ≈ history+message+RAG remainder; `O=600` ≈ typical assistant answer. Measured per-request token counts should replace these when available.
3. **Cache hit rate `h`** — an assumption for scenario analysis (10/50/90); actual hit rate depends on knowledge-base reuse and session design and must be measured.
4. **Google storage** — optional per-hour context-cache storage ($0.03/1M/hour for a 1-hour retention window, default off) — included for completeness but does not change the 10/50/90 core curves.
5. **Follow-up generation** — the agent also emits 4 suggested follow-up questions per exchange, charged as ~15% extra output tokens.

## Notes for the performance/cost owner

- This is the **Phase-5 cost model** completing the Phase-4 cost-per-active-user work. It deliberately does **no feature changes** and only produces measurement/documentation artifacts.
- To track real cost, wire the agent's actual `prompt_feedback`/usage counters into `metrics.ts`, feed them into this model's `requests_per_user_month` and per-request input/output tokens, and compare measured vs. projected cost.

## Reproducing

```bash
# npm / vite front-end is not needed for this notebook; run with the project venv:
jupyter nbconvert --execute --to notebook cost_model.ipynb
# or open cost_model.xlsx in Excel/LibreOffice.
