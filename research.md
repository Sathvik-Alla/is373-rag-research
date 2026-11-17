# Technical research and RAG plan

**Changed.** Scoped the app to account access and defined a technical reader, compared keyword, vector and graph retrieval, selected a provisional stack and prepared a five-note corpus, trace and evaluation.

**Checked.** Reviewed primary technical documentation and reran the keyword fixture experiment, including repeat import and a wording miss. See [RAG actual checks](#rag-actual-checks).

**Next.** By November 24, verify host resources and model access, implement the restricted import and hosted walkthrough, then capture actual retrieval IDs, citations and answers. **Peer feedback pending.** Ask a peer to trace AR-01 and explain what Q3 exposes if either source is absent. Record the actual issue, change and retest when available.

**Purpose and reader.** Animated Realms Access Guide gives a student maintainer quick, sourced answers about sample account and access behavior. The corpus consists of short original demo notes derived from documented Studio 2 behavior. The goal is to distinguish a login redirect, an authorization denial, and a stale-role bug. Use only these texts in the prototype corpus.

### Primary technical sources

Reviewed November 16, 2026.

- **FastAPI** provides the Python HTTP application framework. [FastAPI docs](https://fastapi.tiangolo.com/)
- **RAG** supplies retrieved evidence as context for generation. This design adds passage citations and abstention as application behavior. [Original RAG paper](https://arxiv.org/abs/2005.11401)
- **Vector search** represents text as numeric embeddings. pgvector stores and ranks vectors using distances such as cosine distance, with exact search by default and optional approximate indexes. [pgvector documentation](https://github.com/pgvector/pgvector) · [Ollama embedding endpoint](https://docs.ollama.com/api/embed)
- **Property graphs** store entities as labeled nodes and typed connections as relationships. Cypher can match paths that connect entities. [Neo4j graph concepts](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/)
- **Keyword search** matches tokens and phrases. FTS5 provides MATCH queries and BM25 ranking. [SQLite FTS5](https://www.sqlite.org/fts5.html)
- **Local model serving** uses Ollama's embedding and chat endpoints. Model pages give download and context estimates. [Local FAQ](https://docs.ollama.com/faq) · [Chat endpoint](https://docs.ollama.com/api/chat) · [EmbeddingGemma](https://ollama.com/library/embeddinggemma) · [Qwen2.5](https://ollama.com/library/qwen2.5)

### Retrieval comparison

| Approach | Use in this corpus | Limitation |
| --- | --- | --- |
| SQLite FTS5 keyword baseline | Parameterized MATCH query and BM25 over the same chunks. Good reference for explicit identifiers such as api admin after tokenization. | A rephrased question may miss the right note when its terms differ. |
| PostgreSQL + pgvector | Embed each chunk and question with the same model/configuration, then retrieve the nearest passages by cosine distance. Test candidate for paraphrases where the keyword baseline misses. | Similarity can rank related but insufficient passages. Exact strings and versions still need evaluation and metadata. |
| Neo4j property graph | Model Role, Action, Route and Result entities. Example path is Member → REQUESTS → Admin API with an outcome scoped to that role and request. Link the resulting fact to AR-01. Import validated nodes and typed edges with stable IDs and source references. | Multi-hop questions can benefit from explicit edges. A five-note corpus would require manual modeling and edge validation for limited initial gain. |

### Bounded design choices

1. **Chunking.** Compare one coherent chunk per short note against fixed overlapping windows. Start with one note per chunk, preserving its heading and origin. If notes grow, split at headings or paragraph boundaries before considering token windows. Compare expected evidence in top three using Q1–Q4.
2. **Citation display.** Compare a source list at the end with citations attached to individual claims plus expandable excerpts. Choose claim-level citations so a reviewer can verify which passage supports each claim. Remove AR-04 from Q3's retrieved context and check that the answer states what evidence is missing.

### Stack decision

- **Provisional architecture.** Reuse FastAPI for a public question page and a server-restricted import. Store normalized text, manifest metadata and real vectors in private PostgreSQL with pgvector. Separate source ID and version from the chunk key. For a changed fixture, insert the new version and switch the active version in one transaction. Use exact cosine search for this tiny corpus. Reconsider if Q2 still misses or Q3 needs explicit graph traversal to obtain both facts. Keep SQLite FTS5 as the comparison experiment over identical inputs. A graph prototype becomes useful if repeated relationship queries cannot be answered reliably from the passages.
- **Hosting and model access.** Start locally. For Build, provision the existing Studio 1 server only if resource and access checks pass. Proxy only the FastAPI web endpoint. Keep PostgreSQL and Ollama private. The Plan has no hosted RAG URL. Use local Ollama with EmbeddingGemma and Qwen2.5 1.5B, recording pulled digests, measured dimensions and runtime settings. Model downloads require network access. Local inference uses no hosted model API key. [Hosting project](https://github.com/Sathvik-Alla/my-server-studio)
- **Cost and storage.** Planned external per-request model spend is $0 with local inference. Existing infrastructure costs and host headroom are unverified. Catalog downloads total about 1.6 GB before runtime overhead. Reserve a provisional 4 GB free disk for models, data and logs, then measure. Use a persistent Postgres volume and keep the versioned source text separately rebuildable. Measure model RAM and latency before choosing the Build host.
- **Request limits.** Proposed caps are 400 characters per question, top three passages, 180 generated tokens, one active inference, five questions per minute per client, 30 seconds per model request, and five UTF-8 notes of at most 10 KiB per import. Return 429 for excess traffic and a clear timeout or unavailable response for model failure. These are application settings to test. The current local model load, actual runtime memory and configured context are assumptions to verify before deployment.

### Source manifest

All five version 1 notes below are original, AI-assisted demo text prepared November 16, 2026 for reuse in this class prototype. The scope is these short notes and their citations. Sources in the Origin column establish factual provenance. No private student data is required.

| ID | Origin | Version | Permission |
| --- | --- | --- | --- |
| AR-01 | [Studio 2 role check](https://github.com/Sathvik-Alla/my-app-studio/pull/7) | 1 | Original demo text for class prototype |
| AR-02 | [Studio 2 account decisions](https://github.com/Sathvik-Alla/my-app-studio/blob/main/SPEC.md#app-002--signup-login-and-logout) | 1 | Original demo text for class prototype |
| AR-03 | [Studio 2 role decisions](https://github.com/Sathvik-Alla/my-app-studio/blob/main/SPEC.md#app-003--server-enforced-roles) | 1 | Original demo text for class prototype |
| AR-04 | [Studio 2 same-session observation](https://github.com/Sathvik-Alla/my-app-studio/blob/main/LEARNING.md#app-003) | 1 | Original demo text for class prototype |
| AR-05 | [Studio 2 account observation](https://github.com/Sathvik-Alla/my-app-studio/blob/main/LEARNING.md#app-002) | 1 | Original demo text for class prototype |

#### AR-01

A signed-in member who requests GET /api/admin receives HTTP 403. A signed-out visitor receives HTTP 401. An administrator receives HTTP 200.

#### AR-02

The home page is open to everyone. The dashboard is private. After sign-out, visiting the dashboard redirects to sign-in.

#### AR-03

New signups create member accounts. The trusted local CLI can promote a member to administrator.

#### AR-04

Protected requests read the current database role. After an administrator is downgraded, the same session loses administrator access on the next protected request.

#### AR-05

Signup requires at least 15 characters in the password. Logout revokes the session on the server.

### Planned source walkthrough

1. **Import.** Read the versioned AR-01 text. Validate the source ID, permission and origin URL. Normalize whitespace and hash the content. An identical reimport leaves the active record unchanged. A changed source gets a new version and replaces old active chunks and vectors atomically, after replacement vectors are ready.
2. **Representation.** Store chunk `AR-01:v1:01`, its exact passage, version, location, model identifier, digest and embedding. Reject input overflow during embedding so text cannot silently disappear. A graph representation could connect the member, route and 403 result with provenance on the fact.
3. **Retrieval.** Embed “What does GET /api/admin return for a signed-in member?” using the import model. Rank active chunks by cosine distance and log returned IDs. Expect AR-01 in the top three. Validate this expectation at Build.
4. **Citation and supported answer.** Provide retrieved passages as evidence to the model. Require citation IDs from the retrieved set and resolve them to the active source passage. Check entailment separately because an ID alone does not prove support. Expected answer is “A signed-in member receives HTTP 403.” [AR-01 passage](#ar-01)
5. **Insufficient evidence.** If passages do not support an answer, return an explanation of what the sources lack. Retrieval score and a model-generated citation can both be wrong.

### Planned evaluation

| ID | Question | Expected evidence and behavior |
| --- | --- | --- |
| Q1 · exact term | What does GET /api/admin return for a signed-in member? | AR-01. Answer 403 with citation. |
| Q2 · paraphrase | I ended my session. Where does the private area send me if I reopen it? | AR-02. Dashboard redirects to sign-in. |
| Q3 · relationship | After an administrator becomes a member, what status should the existing session see on the next GET /api/admin request? | AR-04 establishes the next-request role change and AR-01 supplies 403 for a member. Require both citations. Withhold either source and look for an unsupported status or session claim. |
| Q4 · account rule | What minimum password length does signup require? | AR-05. Answer 15 characters with citation. |
| Q5 · unanswerable | Which credit cards does Animated Realms accept for billing? | No supporting passage. State that the corpus does not answer the question. |

**Observable checks, planned and unrun**

1. Import the five notes twice and verify five active IDs and five chunks, then edit one fixture and verify only its new version is retrieved.
2. Run both retrievers against Q1–Q4 on the same chunks. Save ranked IDs and coverage at three. Vector target is the expected evidence for all four, including both IDs for Q3. Record any misses.
3. Open each displayed citation for Q1–Q4 and verify the cited text supports its claim. Q5 should abstain. Repeat Q3 with each required passage removed in turn and verify the answer reports insufficient support.
4. From a signed-out browser, confirm read-only question access and server-side denial of import. Burst past the request limit and check that excess requests receive 429.
5. After deployment and restart, confirm data persists and run Q1 again. Record the deployed revision, ranked IDs, answer, citation, latency and result.

### RAG actual checks

On November 16, 2026, Codex ran [the reproducible baseline script](check_baseline.py) with Python and SQLite 3.50.4. It read the five manifest notes from this file and loaded them twice into an in-memory FTS5 table, replacing rows by document ID. The row-count assertion and five query assertions passed.

| Observable input | Result |
| --- | --- |
| Two fixture loads | 5 rows |
| MATCH phrase `"api admin"` | AR-01 |
| MATCH phrase `"dashboard"` | AR-02 |
| MATCH phrase `"private area"` | No rows |
| MATCH phrase `"downgraded"` | AR-04 |
| MATCH phrase `"billing"` | No rows |

The “private area” miss shows a concrete vocabulary mismatch with the relevant “dashboard” note. The “downgraded” hit retrieves only one of Q3's two expected sources. These are phrase probes, with fixed queries selected by the experimenter. Full-question retrieval, app import, embeddings, generated answers, abstention, and hosted behavior remain planned.

**Own contribution and AI help.** Sathvik provided the course materials, project context and the direction to restart the record. Historical Studio 2 observations supply the underlying behavior. Codex rechecked primary sources, proposed the scope and stack, authored the draft demo notes, and ran the baseline. Student verification and human peer feedback are pending.

### Plan rubric review

| Criterion | Evidence and remaining check |
| --- | --- |
| Complete | Audience, five permitted fixtures, retrieval comparison, architecture, source trace, five questions and five planned checks. |
| Thoughtful | The measured wording miss supports testing a vector retriever. A graph becomes more plausible if multi-source questions repeatedly miss evidence. |
| Checked | Baseline command and expected/observed rows are available. Full retrieval, generation, hosted tests and human peer review are pending. |
| Understood | A claim needs cited evidence and source-appropriate context. Q3's removal check distinguishes role behavior from status-code evidence. The author still needs to verify the draft claims independently. |
