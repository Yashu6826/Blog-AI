import argparse
import asyncio
import re
from datetime import datetime, timedelta
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from configs.db import client, get_db


SEED_SOURCE = "quickblog-tech-seed-v2"


def slugify(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def plain_text(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def metrics(html):
    words = len(plain_text(html).split())
    return words, max(1, round(words / 200))


def article(intro, sections, closing):
    body = [f"<p>{intro}</p>"]
    for heading, paragraphs in sections:
        body.append(f"<h2>{heading}</h2>")
        for paragraph in paragraphs:
            body.append(f"<p>{paragraph}</p>")
    body.append(f"<p><strong>{closing}</strong></p>")
    return "".join(body)


POSTS = [
    {
        "title": "Why your React app feels slow even when Lighthouse looks fine",
        "subTitle": "The missing layer between synthetic scores, real users, and the tiny delays that make interfaces feel heavy.",
        "category": "Frontend",
        "level": "Intermediate",
        "tags": ["#react", "#performance", "#frontend", "#ux"],
        "highlights": [
            "Lighthouse does not measure the whole interaction loop",
            "Input latency usually hides in state shape and rendering boundaries",
        ],
        "content": article(
            "A green Lighthouse score is useful, but it is not a promise that your app feels fast. Real users experience latency through clicks, scrolls, typing, route changes, and whether the interface acknowledges them immediately.",
            [
                ("Measure interactions, not only page load", [
                    "Most teams optimize first paint and then stop. That misses the moments where users actually decide whether the product feels responsive.",
                    "Track route transition time, input delay, query waterfalls, and the number of components that rerender after common actions.",
                ]),
                ("Keep state close to the thing that changes", [
                    "Large global stores make small updates expensive because the blast radius becomes unclear. Push local state down until sharing it is genuinely necessary.",
                    "Server data, form state, URL state, and UI state age differently. Treating all four as one problem is a reliable way to create invisible latency.",
                ]),
                ("Design loading as a product surface", [
                    "A spinner is often less useful than immediate partial feedback. Disable the clicked button, keep old data visible, and stream in the new state when possible.",
                    "The fastest interface is not always the one with the smallest bundle. It is the one that keeps the user oriented while work happens.",
                ]),
            ],
            "Performance work becomes easier when you debug the user journey instead of the scorecard.",
        ),
    },
    {
        "title": "A practical checklist for designing reliable background jobs",
        "subTitle": "Retries, idempotency, visibility, and the boring details that keep async work from becoming production folklore.",
        "category": "Systems",
        "level": "Deep dive",
        "tags": ["#systems", "#queues", "#reliability", "#architecture"],
        "highlights": [
            "Every job should be safe to run more than once",
            "Retries without observability just make failures quieter",
        ],
        "content": article(
            "Background jobs look simple until the first duplicate email, missing invoice, or retry storm. The hard part is not putting work on a queue. The hard part is making that work understandable when reality gets uneven.",
            [
                ("Start with idempotency", [
                    "Assume a worker can crash after doing the side effect but before marking the job complete. If running the job twice causes damage, the job is not ready.",
                    "Use stable operation keys, unique constraints, and explicit status transitions so each external action can be safely retried.",
                ]),
                ("Make failure states queryable", [
                    "A dead letter queue is not a monitoring strategy by itself. Store the last error, retry count, next retry time, and a short business identifier.",
                    "The goal is for support and engineering to answer the same question: what happened to this unit of work?",
                ]),
                ("Throttle the recovery path", [
                    "When a dependency comes back online, every queued retry may wake up at once. Add jitter, concurrency limits, and circuit breakers around the fragile edge.",
                    "Recovery should be a controlled ramp, not a second outage wearing a different hat.",
                ]),
            ],
            "Reliable job systems are built from small promises that remain true under retries, crashes, and partial success.",
        ),
    },
    {
        "title": "Postgres indexes I reach for before adding Redis",
        "subTitle": "A tour of simple indexing choices that can postpone cache complexity for a surprisingly long time.",
        "category": "Databases",
        "level": "Deep dive",
        "tags": ["#postgres", "#databases", "#performance", "#backend"],
        "highlights": [
            "The right composite index can beat a premature cache",
            "Partial indexes encode product facts directly into storage",
        ],
        "content": article(
            "Redis is a good tool, but it is often invited too early. Before adding cache invalidation to your system, check whether Postgres already has enough information to answer the query quickly.",
            [
                ("Composite indexes need query-shaped thinking", [
                    "The order of columns matters because the database walks the index from left to right. Put equality filters first, then range filters, then sorting needs.",
                    "An index on user_id and created_at is not just a performance object. It is a statement about how the product reads a user's history.",
                ]),
                ("Partial indexes keep hot paths small", [
                    "If most queries ask for active rows, draft rows, unprocessed jobs, or published posts, index only that subset.",
                    "Smaller indexes are cheaper to maintain and easier for the planner to choose confidently.",
                ]),
                ("Use explain plans as a conversation", [
                    "EXPLAIN ANALYZE tells you what the database actually did, not what you hoped it would do. Save plans before and after changes.",
                    "When the row estimates are wildly wrong, the fix might be statistics, not another index.",
                ]),
            ],
            "A good index removes work. A cache moves work somewhere else. Try removing it first.",
        ),
    },
    {
        "title": "Building AI features that do not collapse after the demo",
        "subTitle": "Prompts are only one part of the product; evals, latency, cost, and fallback behavior decide whether the feature survives.",
        "category": "AI",
        "level": "Intermediate",
        "tags": ["#ai", "#llm", "#product", "#evals"],
        "highlights": [
            "Write evals before polishing prompts",
            "Fallback states are part of the AI feature, not edge cases",
        ],
        "content": article(
            "A demo can survive on one great prompt. A product cannot. Once users bring messy input, inconsistent intent, and patience measured in seconds, the feature needs a system around the model.",
            [
                ("Define what good means", [
                    "Collect examples of excellent, acceptable, and unacceptable outputs. Use them as a small eval set before every prompt change.",
                    "If the team cannot agree on what good output looks like, the model will not rescue the product definition.",
                ]),
                ("Make latency visible early", [
                    "Streaming, optimistic UI, and progress states matter because model calls are not instant. The user needs proof that the product is working.",
                    "Measure time to first token, time to useful output, and cancellation rate. Average latency hides frustration.",
                ]),
                ("Treat cost as a product metric", [
                    "Track cost per successful task, not only cost per request. Retries, long prompts, and abandoned generations all belong in the equation.",
                    "A cheaper model with better routing can outperform a stronger model used everywhere.",
                ]),
            ],
            "Durable AI products are designed around uncertainty instead of pretending it is not there.",
        ),
    },
    {
        "title": "Spring Boot architecture that stays readable after the first release",
        "subTitle": "Controllers, services, repositories, DTOs, and configuration boundaries that keep Java APIs pleasant to change.",
        "category": "Java Spring Boot",
        "level": "Intermediate",
        "tags": ["#java", "#springboot", "#backend", "#architecture"],
        "highlights": [
            "Keep HTTP, business logic, and persistence concerns separate",
            "DTOs protect your API from accidental database coupling",
        ],
        "content": article(
            "A Spring Boot project can be productive very quickly, but the early folder structure often decides how painful the next six months feel. The goal is not ceremony. The goal is knowing where a change belongs.",
            [
                ("Let controllers stay thin", [
                    "Controllers should translate HTTP into application intent: request validation, auth context, response status, and DTO mapping. They should not become the place where business rules quietly accumulate.",
                    "When controllers are thin, endpoints become easier to test and easier to reason about during production debugging.",
                ]),
                ("Use services for transactions and decisions", [
                    "Service methods are a natural home for orchestration: loading records, enforcing rules, calling collaborators, and deciding what happens next.",
                    "Keep transaction boundaries explicit at this layer so database work and domain decisions move together.",
                ]),
                ("Do not leak entities as API contracts", [
                    "JPA entities are persistence models, not public promises. Returning them directly can expose fields, trigger lazy-loading surprises, and make schema changes feel like API migrations.",
                    "DTOs add a little code, but they buy you control over what the outside world can depend on.",
                ]),
            ],
            "A calm Spring Boot codebase is built from boring boundaries that everyone can recognize.",
        ),
    },
    {
        "title": "Spring Security JWT authentication without the mystery",
        "subTitle": "A practical mental model for filters, claims, token expiry, and protecting routes in a REST API.",
        "category": "Java Spring Boot",
        "level": "Practical",
        "tags": ["#java", "#springboot", "#security", "#jwt"],
        "highlights": [
            "JWT auth is mostly request filtering plus careful token rules",
            "Short-lived access tokens reduce the cost of leaked credentials",
        ],
        "content": article(
            "Spring Security feels intimidating because it is powerful and configurable. For a REST API using JWTs, the core idea is simple: every protected request must prove who it is before it reaches your controller.",
            [
                ("Understand the filter chain", [
                    "A JWT filter reads the Authorization header, validates the token, extracts claims, and places an authenticated principal into the security context.",
                    "Once that context exists, route rules and method-level permissions can make decisions without each controller parsing tokens by hand.",
                ]),
                ("Keep token claims small", [
                    "Put stable identity and authorization hints in the token, not a full user profile. Large or frequently changing claims create stale authorization problems.",
                    "Use user id, role, issuer, audience, issued time, and expiry as the core contract.",
                ]),
                ("Design logout and refresh intentionally", [
                    "A stateless access token cannot be magically deleted from every client. Short expiry plus refresh-token rotation is usually easier to reason about.",
                    "For high-risk apps, store refresh tokens server-side so they can be revoked after suspicious activity.",
                ]),
            ],
            "JWT security becomes less mysterious when you treat tokens as limited proofs, not permanent sessions.",
        ),
    },
    {
        "title": "Building REST APIs in Spring Boot that frontend teams enjoy using",
        "subTitle": "Validation, errors, pagination, and response shapes that make client code smaller and more predictable.",
        "category": "Java Spring Boot",
        "level": "Practical",
        "tags": ["#java", "#springboot", "#api", "#frontend"],
        "highlights": [
            "Good error responses are product design for developers",
            "Pagination metadata belongs in the API response",
        ],
        "content": article(
            "A REST API is not only a backend implementation detail. It is the interface another team builds their day around. Small consistency choices in Spring Boot can remove a surprising amount of frontend complexity.",
            [
                ("Validate at the boundary", [
                    "Use request DTOs with validation annotations so invalid input is rejected before it touches business logic.",
                    "Return field-level validation messages in a predictable shape so forms can show useful feedback without custom parsing for every endpoint.",
                ]),
                ("Standardize errors", [
                    "Create one error response format with code, message, details, and request id. Then handle common exceptions centrally with controller advice.",
                    "When errors are consistent, frontend code can build one path for display, logging, and retry behavior.",
                ]),
                ("Make list endpoints explicit", [
                    "List responses should include items, page size, cursor or page number, and whether more data exists.",
                    "Clients should not have to guess if the end of the list was reached just because the array happened to be short.",
                ]),
            ],
            "Backend quality often shows up as frontend simplicity.",
        ),
    },
    {
        "title": "What AI agents are good at, and where they still need guardrails",
        "subTitle": "Agents can plan, call tools, and recover from partial progress, but autonomy only helps when the task has clear boundaries.",
        "category": "AI",
        "level": "Intermediate",
        "tags": ["#ai", "#agents", "#llm", "#automation"],
        "highlights": [
            "Agents need constrained tools and observable steps",
            "Autonomy works best when success can be checked",
        ],
        "content": article(
            "An AI agent is more than a chatbot with a longer prompt. It is a system that can reason about a goal, choose actions, call tools, inspect results, and continue until the work reaches a stopping condition.",
            [
                ("Start with bounded workflows", [
                    "The best first agent tasks have clear inputs, known tools, and verifiable outputs: triaging tickets, drafting reports from approved sources, or updating records after validation.",
                    "Vague goals create vague behavior. Give the agent a small operating lane before expanding autonomy.",
                ]),
                ("Treat tools as permissions", [
                    "Every tool gives the agent power. Read-only search is different from sending email, editing a database, or charging a customer.",
                    "Use confirmations, scoped credentials, audit logs, and dry-run modes around actions with real-world consequences.",
                ]),
                ("Make progress inspectable", [
                    "A useful agent should leave behind what it tried, what it learned, what failed, and why it stopped.",
                    "Observability turns an agent from a mysterious assistant into an operational system your team can improve.",
                ]),
            ],
            "Agents are most useful when they combine initiative with clear limits.",
        ),
    },
    {
        "title": "Why LLMs hallucinate and how product teams can reduce the damage",
        "subTitle": "Hallucination is not one bug; it is a set of failure modes around uncertainty, missing context, and incentives to answer anyway.",
        "category": "AI",
        "level": "Deep dive",
        "tags": ["#ai", "#llm", "#hallucinations", "#evals"],
        "highlights": [
            "Models can sound confident when evidence is weak",
            "Grounding, refusal paths, and evals reduce user-facing risk",
        ],
        "content": article(
            "LLM hallucination is the moment a model produces an answer that looks plausible but is unsupported, outdated, or simply wrong. The frustrating part is that the prose can still sound polished.",
            [
                ("Separate knowledge from language", [
                    "Language models are very good at continuing patterns. That does not mean they have verified the facts behind every sentence.",
                    "When the task depends on exact names, numbers, policies, or recent events, the model needs access to trusted context instead of memory alone.",
                ]),
                ("Give the model permission to say no", [
                    "Prompts should reward uncertainty when evidence is missing. A system that always demands an answer teaches the model to improvise.",
                    "Useful refusal behavior is not failure. It is part of a trustworthy product contract.",
                ]),
                ("Test hallucination directly", [
                    "Build eval cases with missing documents, conflicting sources, adversarial questions, and questions that should trigger refusal.",
                    "Track whether the model cites the provided context, invents facts, or answers beyond what the system can know.",
                ]),
            ],
            "The goal is not pretending hallucinations disappear. The goal is designing so they are less likely, easier to catch, and less harmful.",
        ),
    },
    {
        "title": "RAG systems that answer from your data instead of vibes",
        "subTitle": "Retrieval-augmented generation works when chunking, search, ranking, and citations are treated as product quality levers.",
        "category": "AI",
        "level": "Deep dive",
        "tags": ["#ai", "#rag", "#llm", "#search"],
        "highlights": [
            "Retrieval quality usually matters more than prompt cleverness",
            "Citations are only useful when tied to exact source passages",
        ],
        "content": article(
            "RAG sounds simple: retrieve relevant documents, place them in the prompt, and ask the model to answer. In practice, most failures come from retrieving the wrong context or hiding the source of truth from users.",
            [
                ("Chunk for the question, not the file", [
                    "Huge chunks bury the answer. Tiny chunks lose meaning. Good chunking preserves enough surrounding context for the model to understand why a passage matters.",
                    "Use headings, sections, tables, and document structure when possible instead of splitting blindly by character count.",
                ]),
                ("Rank before you generate", [
                    "Vector search is often a first pass, not the whole retrieval system. Hybrid search, metadata filters, and reranking can dramatically improve answer quality.",
                    "If the right evidence is not in the context window, the best model still has to guess.",
                ]),
                ("Show the source trail", [
                    "Citations should point to the exact passages used, not just the document title. Users need a fast way to verify the answer.",
                    "A good RAG interface turns confidence into something inspectable.",
                ]),
            ],
            "RAG quality is search quality wearing an AI interface.",
        ),
    },
    {
        "title": "Observability for LLM apps: what to log, measure, and review",
        "subTitle": "Prompts, retrieval results, tool calls, latency, cost, and user feedback all belong in the operational picture.",
        "category": "AI",
        "level": "Practical",
        "tags": ["#ai", "#llm", "#observability", "#product"],
        "highlights": [
            "Cost per successful task is more useful than cost per token",
            "Tool calls and retrieved context should be traceable",
        ],
        "content": article(
            "Traditional logs tell you whether a request failed. LLM observability also needs to tell you whether the answer was useful, grounded, affordable, and produced through the path you expected.",
            [
                ("Trace the full generation path", [
                    "Capture model name, prompt version, retrieved document ids, tool calls, latency, token usage, and final status.",
                    "This makes regressions easier to investigate when a prompt change or retrieval tweak quietly changes behavior.",
                ]),
                ("Measure outcomes, not only requests", [
                    "A request can succeed technically while failing the user. Track thumbs-down feedback, regenerations, abandoned flows, edits, and escalation to human support.",
                    "These signals help you find the places where polished text hides poor task completion.",
                ]),
                ("Protect sensitive data", [
                    "LLM traces can contain private user input and internal documents. Redact secrets and set clear retention rules before logs become a liability.",
                    "Observability should improve trust, not create another security problem.",
                ]),
            ],
            "An LLM feature becomes maintainable when its behavior can be inspected after the demo is over.",
        ),
    },
    {
        "title": "Prompt injection is an application security problem",
        "subTitle": "LLM apps need instruction boundaries, tool permissions, and data isolation because user text can be hostile input.",
        "category": "AI Security",
        "level": "Deep dive",
        "tags": ["#ai", "#security", "#llm", "#agents"],
        "highlights": [
            "Treat retrieved text and user input as untrusted",
            "Tool access should be scoped outside the prompt",
        ],
        "content": article(
            "Prompt injection happens when untrusted text tries to override the application's instructions. In an LLM app, that text might come from a user, a web page, an email, a document, or a retrieved knowledge-base article.",
            [
                ("Separate instructions from data", [
                    "The model should be told which content is user data, which content is retrieved evidence, and which instructions come from the application.",
                    "Clear formatting helps, but security cannot depend on formatting alone.",
                ]),
                ("Enforce permissions in code", [
                    "Do not rely on the model to decide whether it is allowed to send an email, reveal a secret, or modify a record. The application should check permissions before tool execution.",
                    "The model can request an action, but the system must authorize it.",
                ]),
                ("Design for suspicious content", [
                    "Retrieved pages may contain instructions like ignore previous rules or leak hidden context. Test these cases deliberately.",
                    "A strong LLM app treats external text the way a web app treats form input: useful, but never automatically trusted.",
                ]),
            ],
            "Prompt injection defense starts when you stop treating prompts as the only control layer.",
        ),
    },
    {
        "title": "What good API pagination looks like in real products",
        "subTitle": "Offset, cursor, filtering, sorting, and the contract details that prevent feeds from drifting or duplicating records.",
        "category": "Backend",
        "level": "Intermediate",
        "tags": ["#api", "#backend", "#databases", "#architecture"],
        "highlights": [
            "Cursor pagination should encode a stable ordering",
            "Filters and sorting are part of the pagination contract",
        ],
        "content": article(
            "Pagination is easy until records are inserted while a user is scrolling. Then offset pages start skipping or repeating data and every client invents a workaround.",
            [
                ("Choose a stable sort", [
                    "A cursor needs a deterministic order. created_at alone is often not enough because two rows can share the same timestamp.",
                    "Use a pair such as created_at and id, then encode both values into the cursor.",
                ]),
                ("Keep filters in the contract", [
                    "A cursor generated for one filter set should not be reused for another. Include the query shape in validation or make cursors short-lived.",
                    "The API should make incorrect usage hard, not merely documented.",
                ]),
                ("Return useful page metadata", [
                    "Clients need has_next_page, next_cursor, and sometimes total counts. Do not force every frontend to infer pagination state from array length.",
                    "Good pagination reduces UI complexity because the server owns the data boundary.",
                ]),
            ],
            "A pagination API is a promise about order. Make that promise explicit.",
        ),
    },
    {
        "title": "The boring architecture that keeps dashboards maintainable",
        "subTitle": "Dashboards become painful when every chart owns its own data fetching, formatting, and failure behavior.",
        "category": "Frontend",
        "level": "Notes",
        "tags": ["#frontend", "#react", "#product", "#architecture"],
        "highlights": [
            "Separate data shape from display shape",
            "Empty states are part of the chart system",
        ],
        "content": article(
            "Dashboards usually begin as a few charts and become a dense operational surface. The difference between useful and fragile is rarely the chart library. It is the architecture around the data.",
            [
                ("Normalize at the boundary", [
                    "Convert API responses into a predictable view model before rendering. Components should not know every backend quirk.",
                    "This also makes loading, empty, and error states easier to standardize across the page.",
                ]),
                ("Design for comparison", [
                    "Users scan dashboards to compare states. Keep units, time ranges, labels, and color meaning consistent.",
                    "A beautiful chart that cannot be compared with its neighbor is decoration.",
                ]),
                ("Centralize refresh behavior", [
                    "If every widget refetches independently, the dashboard will flicker and drift. Use shared refresh intervals or explicit user-triggered reloads.",
                    "Operational screens should feel calm even when the data underneath is changing.",
                ]),
            ],
            "Maintainable dashboards are built by making the common states boring and predictable.",
        ),
    },
    {
        "title": "How to review a pull request when the diff is too large",
        "subTitle": "A survival guide for finding real risk in a change that refuses to fit in your head all at once.",
        "category": "Career",
        "level": "Practical",
        "tags": ["#engineering", "#process", "#culture", "#reviews"],
        "highlights": [
            "Review behavior before style",
            "Ask for smaller follow-up diffs when risk is hidden by volume",
        ],
        "content": article(
            "Large pull requests happen. The question is not whether they are ideal. The question is how to review one without pretending you understood every line equally.",
            [
                ("Find the behavior boundary", [
                    "Start with what changed for users, APIs, data, permissions, or background jobs. These are the places where regressions matter most.",
                    "A large diff becomes smaller once you identify the contracts it touches.",
                ]),
                ("Look for irreversible actions", [
                    "Migrations, deletes, payments, emails, and external side effects deserve extra attention. A styling bug is annoying; a duplicate invoice is expensive.",
                    "Trace those paths with a slower eye and ask for tests where the blast radius is high.",
                ]),
                ("Leave review notes that create progress", [
                    "Separate blocking issues from optional improvements. If everything sounds equally important, nothing is.",
                    "A good review helps the author land the change safely and makes the next change easier.",
                ]),
            ],
            "The best large-diff review is honest about uncertainty and sharp about risk.",
        ),
    },
    {
        "title": "Logging mistakes that make incidents harder than they need to be",
        "subTitle": "Useful logs answer who, what, where, and why without turning production into a wall of strings.",
        "category": "Infra",
        "level": "Practical",
        "tags": ["#observability", "#infra", "#logging", "#systems"],
        "highlights": [
            "A log line should carry enough context to stand alone",
            "High-cardinality fields need care, not fear",
        ],
        "content": article(
            "Logging is often treated as something you add after the feature works. During an incident, that decision comes due. The logs either tell a story or force you to reconstruct one from fragments.",
            [
                ("Prefer structured fields", [
                    "A message string is for humans. Fields are for filtering, grouping, and correlation. Include request_id, user_id where appropriate, job_id, and the operation name.",
                    "The goal is to move from a symptom to a specific path through the system quickly.",
                ]),
                ("Log decisions, not just errors", [
                    "Many incidents are caused by expected branches: skipped work, rejected input, fallback behavior, or feature flags. Those decisions deserve visibility.",
                    "An error without the decision history before it is only the last page of the story.",
                ]),
                ("Keep sensitive data out", [
                    "Useful context should not mean leaking secrets, tokens, or private user content. Redaction needs to be part of the logging design.",
                    "The best incident log is helpful to operators and boring to auditors.",
                ]),
            ],
            "Logs are production memory. Make them easy to search before you need them.",
        ),
    },
    {
        "title": "Designing feature flags that do not become permanent clutter",
        "subTitle": "Flags are powerful because they separate deploy from release, but every flag needs an owner and an exit plan.",
        "category": "Product",
        "level": "Notes",
        "tags": ["#product", "#architecture", "#process", "#release"],
        "highlights": [
            "Every flag should have an expiry or cleanup trigger",
            "Flag combinations create their own test matrix",
        ],
        "content": article(
            "Feature flags are one of the most useful release tools a team can adopt. They are also one of the easiest ways to leave confusing branches all over a codebase.",
            [
                ("Name the decision, not the implementation", [
                    "A flag called new_checkout_button ages poorly. A flag called checkout_experiment_2026_08 tells future readers why it exists.",
                    "Good naming turns cleanup from archaeology into maintenance.",
                ]),
                ("Track ownership", [
                    "A flag without an owner becomes everyone else's problem. Store who owns it, when it was created, and what event lets it be removed.",
                    "The flag system should make old flags visible before they become invisible risk.",
                ]),
                ("Test important combinations", [
                    "Flags multiply states. The critical path should be tested with the flag on and off until the old path is removed.",
                    "Release safety comes from controlling state, not from adding branches forever.",
                ]),
            ],
            "A feature flag is a temporary product decision. Treat it that way in code too.",
        ),
    },
    {
        "title": "When to split a service and when to keep the monolith",
        "subTitle": "Microservices solve ownership and scaling problems, but they also charge rent in latency, deployment, and debugging.",
        "category": "Systems",
        "level": "Deep dive",
        "tags": ["#systems", "#architecture", "#backend", "#infra"],
        "highlights": [
            "Split on ownership before splitting on code aesthetics",
            "A network boundary makes every dependency more expensive",
        ],
        "content": article(
            "The monolith versus microservices debate is usually too abstract. The better question is which boundary would reduce coordination without making production harder to understand.",
            [
                ("Look for independent change rates", [
                    "If two parts of the system are owned by different teams, deployed on different schedules, and fail differently, a service boundary might help.",
                    "If they change together every week, splitting them may only add distributed friction.",
                ]),
                ("Price the operational cost", [
                    "A new service needs deploys, observability, alerting, auth, retries, dashboards, and on-call knowledge. That cost is real even when the code is small.",
                    "The first service split should be boring enough that the team learns the operating model safely.",
                ]),
                ("Keep data boundaries honest", [
                    "Shared databases can make services look separate while keeping them tightly coupled. Event contracts and ownership rules matter more than repository layout.",
                    "The goal is autonomy, not just more folders.",
                ]),
            ],
            "Split when the organizational and operational benefits beat the permanent cost of another moving part.",
        ),
    },
    {
        "title": "Caching rules I wish every API documented",
        "subTitle": "Freshness, invalidation, stale reads, and the expectations clients need before they build around your responses.",
        "category": "Backend",
        "level": "Intermediate",
        "tags": ["#api", "#backend", "#performance", "#architecture"],
        "highlights": [
            "Cache behavior is part of the API contract",
            "Stale data is fine only when the product accepts it",
        ],
        "content": article(
            "Caching bugs are rarely about the cache alone. They happen because nobody wrote down what freshness means for the product.",
            [
                ("Document freshness windows", [
                    "If data can be stale for sixty seconds, say so. Clients can design better loading and refresh behavior when they know the rules.",
                    "Silent caching creates support tickets because users cannot tell whether the system ignored them.",
                ]),
                ("Make invalidation explicit", [
                    "Every write path should describe what cached reads become stale and how they recover. Invalidation is not a footnote.",
                    "Sometimes the right answer is not caching at all for a path where correctness matters more than speed.",
                ]),
                ("Separate private and shared data", [
                    "User-specific responses should be cached with different rules from public content. Headers, keys, and permissions need to line up.",
                    "A fast leak is still a leak.",
                ]),
            ],
            "The best cache is not invisible. It is predictable.",
        ),
    },
    {
        "title": "TypeScript habits that keep large React codebases calmer",
        "subTitle": "The point is not perfect types. The point is moving mistakes closer to the editor and farther from production.",
        "category": "Frontend",
        "level": "Practical",
        "tags": ["#typescript", "#react", "#frontend", "#engineering"],
        "highlights": [
            "Model domain states as unions, not loose booleans",
            "Make illegal component states difficult to represent",
        ],
        "content": article(
            "TypeScript helps most when it describes product states, not when it decorates JavaScript with vague annotations. The best types make impossible states awkward to write.",
            [
                ("Replace boolean clusters with unions", [
                    "isLoading, isError, isEmpty, and isSuccess can accidentally be true in impossible combinations. A status union makes the state machine visible.",
                    "This improves rendering code because each branch gets a clear shape of data.",
                ]),
                ("Type component contracts at the boundary", [
                    "A component should ask for exactly the data it needs. Passing entire API responses through the tree spreads backend details everywhere.",
                    "View models keep UI code focused and make redesigns cheaper.",
                ]),
                ("Use unknown at unsafe edges", [
                    "External input deserves parsing. Treating untrusted JSON as a known type only moves runtime bugs into nicer syntax.",
                    "The combination of validation and TypeScript is where confidence actually appears.",
                ]),
            ],
            "Good types are not about cleverness. They are about making the next change less surprising.",
        ),
    },
]


async def ensure_author(db, email, name):
    user = await db["users"].find_one({"email": email})
    now = datetime.utcnow().isoformat()
    if user:
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"name": user.get("name") or name, "role": user.get("role", "author"), "updatedAt": now}},
        )
        user.update({"name": user.get("name") or name, "role": user.get("role", "author")})
        return user

    doc = {
        "name": name,
        "email": email,
        "passwordHash": "",
        "bio": "Seeded QuickBlog author",
        "role": "author",
        "provider": "seed",
        "createdAt": now,
        "updatedAt": now,
    }
    doc["_id"] = (await db["users"].insert_one(doc)).inserted_id
    return doc


async def seed(
    reset=False,
    keep_seeded_only=False,
    remove_legacy_seeds=False,
    author_email="seed-author@quickblog.dev",
    author_name="QuickBlog Team",
):
    db = get_db()
    author = await ensure_author(db, author_email, author_name)
    if remove_legacy_seeds:
        legacy_filter = {
            "seedSource": {
                "$regex": r"^quickblog-tech-seed-",
                "$ne": SEED_SOURCE,
            }
        }
        legacy_blog_ids = [
            blog["_id"]
            for blog in await db["blogs"].find(legacy_filter, {"_id": 1}).to_list(length=None)
        ]
        if legacy_blog_ids:
            deleted_blogs = await db["blogs"].delete_many({"_id": {"$in": legacy_blog_ids}})
            deleted_comments = await db["comments"].delete_many({"blog": {"$in": legacy_blog_ids}})
            print(
                f"Removed {deleted_blogs.deleted_count} legacy seeded blogs "
                f"and {deleted_comments.deleted_count} related comments."
            )
        else:
            print("No legacy seeded blogs found to remove.")

    if keep_seeded_only:
        old_blog_ids = [
            blog["_id"]
            for blog in await db["blogs"].find(
                {"seedSource": {"$ne": SEED_SOURCE}},
                {"_id": 1},
            ).to_list(length=None)
        ]
        if old_blog_ids:
            deleted_blogs = await db["blogs"].delete_many({"_id": {"$in": old_blog_ids}})
            deleted_comments = await db["comments"].delete_many({"blog": {"$in": old_blog_ids}})
            print(f"Removed {deleted_blogs.deleted_count} old blogs and {deleted_comments.deleted_count} related comments.")
        else:
            print("No old blogs found to remove.")

    if reset:
        deleted = await db["blogs"].delete_many({"seedSource": SEED_SOURCE})
        print(f"Removed {deleted.deleted_count} existing seeded blogs.")

    base_date = datetime.utcnow()
    upserted = 0
    updated = 0

    for index, post in enumerate(POSTS):
        words, read_time = metrics(post["content"])
        created = (base_date - timedelta(days=index * 5)).isoformat()
        reads = 12400 + (len(POSTS) - index) * 1730
        doc = {
            "seedSource": SEED_SOURCE,
            "seedKey": slugify(post["title"]),
            "title": post["title"],
            "subTitle": post["subTitle"],
            "excerpt": post["subTitle"],
            "description": post["content"],
            "contentHtml": post["content"],
            "category": post["category"],
            "tags": post["tags"],
            "highlights": post["highlights"],
            "level": post["level"],
            "slug": slugify(post["title"]),
            "wordCount": words,
            "readTime": read_time,
            "reads": reads,
            "image": None,
            "coverImage": None,
            "isPublished": True,
            "status": "published",
            "createdAt": created,
            "updatedAt": created,
            "publishedAt": created,
            "authorId": author["_id"],
            "authorName": author.get("name", author_name),
            "authorEmail": author.get("email", author_email),
            "authorBio": author.get("bio", ""),
        }
        result = await db["blogs"].update_one(
            {"seedSource": SEED_SOURCE, "seedKey": doc["seedKey"]},
            {"$set": doc},
            upsert=True,
        )
        upserted += 1 if result.upserted_id else 0
        updated += 1 if result.matched_count else 0

    print(f"Seed complete. Inserted {upserted}, updated {updated}, total {len(POSTS)} posts.")
    client.close()


async def status():
    db = get_db()
    total = await db["blogs"].count_documents({})
    seeded = await db["blogs"].count_documents({"seedSource": SEED_SOURCE})
    categories = sorted(await db["blogs"].distinct("category"))
    tags = sorted(await db["blogs"].distinct("tags"))
    print(f"total={total}")
    print(f"seeded={seeded}")
    print(f"categories={', '.join(categories)}")
    print(f"tags={', '.join(tags)}")
    client.close()


def main():
    parser = argparse.ArgumentParser(description="Seed QuickBlog with tech-oriented sample posts.")
    parser.add_argument("--status", action="store_true", help="Print blog counts, categories, and tags without writing.")
    parser.add_argument("--reset", action="store_true", help="Delete this script's existing seeded posts before inserting.")
    parser.add_argument("--remove-legacy-seeds", action="store_true", help="Delete older QuickBlog seed versions only.")
    parser.add_argument("--keep-seeded-only", action="store_true", help="Delete all blogs that were not created by this seed script.")
    parser.add_argument("--author-email", default="seed-author@quickblog.dev")
    parser.add_argument("--author-name", default="QuickBlog Team")
    args = parser.parse_args()
    if args.status:
        asyncio.run(status())
    else:
        asyncio.run(
            seed(
                args.reset,
                args.keep_seeded_only,
                args.remove_legacy_seeds,
                args.author_email,
                args.author_name,
            )
        )


if __name__ == "__main__":
    main()
