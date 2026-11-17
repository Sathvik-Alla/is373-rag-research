import { defineConfig } from 'vitepress'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const repository = 'https://github.com/Sathvik-Alla/is373-rag-research'
const groups = [
  [
    "research",
    "Technical research",
    [
      "Primary technical sources"
    ]
  ],
  [
    "comparison",
    "Retrieval comparison",
    [
      "Retrieval comparison",
      "Bounded design choices"
    ]
  ],
  [
    "architecture",
    "Architecture",
    [
      "Stack decision",
      "Planned source walkthrough"
    ]
  ],
  [
    "sources",
    "Permitted sources",
    [
      "Source manifest"
    ]
  ],
  [
    "evaluation",
    "Evaluation and checks",
    [
      "Planned evaluation",
      "RAG actual checks",
      "Plan rubric review"
    ]
  ]
]
const folder = new URL('../.site-content/', import.meta.url)
const source = readFileSync(new URL('../research.md', import.meta.url), 'utf8')
const sections = new Map()
for (const match of source.matchAll(/^### (.+)\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)) {
  sections.set(match[1], match[2].trim())
}

const slug = heading => heading.toLowerCase().replace(/[^a-z0-9 ]/g, '').replaceAll(' ', '-')
const destinations = new Map()
for (const [page, , headings] of groups) {
  for (const heading of headings) destinations.set(slug(heading), page)
}
for (const id of ['ar-01', 'ar-02', 'ar-03', 'ar-04', 'ar-05']) destinations.set(id, 'sources')

function renderLinks(markdown, page) {
  return markdown
    .replace(/\]\(#([\w-]+)\)/g, (_, anchor) => {
      const target = destinations.get(anchor)
      if (!target) throw new Error(`Unknown research heading: ${anchor}`)
      return `](${target === page ? '' : target + '.md'}#${anchor})`
    })
    .replaceAll('](check_baseline.py)', `](${repository}/blob/main/check_baseline.py)`)
}

mkdirSync(folder, { recursive: true })
const write = (name, content) => writeFileSync(new URL(`${name}.md`, folder), content)
write('index', readFileSync(new URL('../site-home.md', import.meta.url), 'utf8'))
const overview = source.split(/\r?\n### /, 1)[0].replace(/^# .+/, '# Overview')
write('overview', renderLinks(overview, 'overview') + '\n\n[Combined Individual Plan](https://github.com/Sathvik-Alla/is373-career-research/blob/main/PROJECT_RECORD.md)\n')
for (const [page, title, headings] of groups) {
  const body = headings.map(heading => {
    if (!sections.has(heading)) throw new Error(`Missing research section: ${heading}`)
    return `## ${heading}\n\n${sections.get(heading).replace(/^#### /gm, '### ')}`
  }).join('\n\n')
  write(page, `# ${title}\n\n${renderLinks(body, page)}\n`)
}

const pages = [{ text: 'Overview', link: '/overview' },
  ...groups.map(([page, title]) => ({ text: title, link: '/' + page }))]

export default defineConfig({
  title: 'RAG Research',
  description: "Sathvik Alla · The Animated Realms Access Guide is a plan for answering account and permission questions from five versioned notes.",
  base: '/is373-rag-research/',
  srcDir: fileURLToPath(folder),
  outDir: '.vitepress/dist',
  themeConfig: {
    nav: pages,
    sidebar: [{ text: 'RAG Research', items: pages }],
    outline: [2, 3],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: repository }],
    footer: { copyright: 'Sathvik Alla · NJIT IS373 · Fall 2026' },
  },
})
