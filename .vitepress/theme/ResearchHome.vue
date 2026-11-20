<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
const props = defineProps({ kind: String })
const selected = ref('')
const pageUrl = path => withBase(path + '.html')
const isCareer = computed(() => props.kind === 'career')
const choices = computed(() => isCareer.value ? [
  { id: 'employers', title: 'Inspect the employer evidence', detail: 'Three postings with eligibility, responsibilities, and gaps.', link: '/employers', result: 'Start with the Palantir FDE reference and the two Amazon early-career examples. Check each requirement against the linked posting.' },
  { id: 'directions', title: 'Compare career directions', detail: 'Backend engineering and customer-facing deployment.', link: '/directions', result: 'The provisional backend direction draws on FastAPI access-control work. The comparison records the additional customer-discovery evidence needed for FDE work.' },
  { id: 'portfolio', title: 'Follow the work evidence', detail: 'Connect a responsibility to code, decisions, and checks.', link: '/portfolio', result: 'The portfolio plan maps three responsibilities to Studio 2 artifacts and compares two layouts for a technical hiring reader.' },
  { id: 'checks', title: 'Review the limits', detail: 'Actual checks, pending feedback, and the next action.', link: '/checks', result: 'Historical Studio 2 checks are labeled. The IS373 group case study and human peer feedback are still pending.' }
] : [
  { id: 'sources', title: 'Begin with the sources', detail: 'Five permitted account and access notes.', link: '/sources', result: 'Each AR source has an ID, version, origin, and permission statement. These short demo notes define the proposed retrieval corpus.' },
  { id: 'comparison', title: 'Compare retrieval methods', detail: 'Keyword, vector, and graph options for the same questions.', link: '/comparison', result: 'The keyword phrase probe missed “private area.” The plan proposes vector retrieval and retains the baseline for comparison.' },
  { id: 'architecture', title: 'Trace a supported answer', detail: 'Import, representation, retrieval, and citation.', link: '/architecture', result: 'Follow AR-01 to the planned member-access answer. The walkthrough identifies expected evidence and the checks that still need to run.' },
  { id: 'evaluation', title: 'Inspect the results', detail: 'Executed phrase probes and planned app checks.', link: '/evaluation', result: 'Five keyword assertions and a row-count assertion passed. Vector retrieval, generated answers, and hosted application behavior remain planned.' }
])
const active = computed(() => choices.value.find(item => item.id === selected.value))
const mapNodes = computed(() => isCareer.value ? [
  { title: 'Employer requirements', link: '/employers' },
  { title: 'Career directions', link: '/directions' },
  { title: 'FastAPI evidence', link: '/portfolio' },
  { title: 'Checks and next steps', link: '/checks' }
] : [
  { title: 'Permitted notes', link: '/sources' },
  { title: 'Representation', link: '/research' },
  { title: 'Retrieval choices', link: '/comparison' },
  { title: 'Answer evaluation', link: '/evaluation' }
])
</script>

<template>
<main class="research-home">
  <section class="research-hero" aria-labelledby="home-title">
    <div>
      <p class="kicker">Sathvik Alla · NJIT IS373</p>
      <h1 id="home-title">{{ isCareer ? 'Explore the work.' : 'Start with a source.' }}<span>{{ isCareer ? 'Build the evidence.' : 'Check the answer.' }}</span></h1>
      <p class="hero-description">{{ isCareer ? 'A career research plan connecting employer responsibilities to FastAPI work and a provisional backend engineering direction.' : 'A research plan for the Animated Realms Access Guide, answering account and permission questions with traceable evidence.' }}</p>
      <div class="hero-actions">
        <a class="primary-link" href="#explore">Explore the research</a>
        <a :href="pageUrl(isCareer ? '/employers' : '/architecture')">{{ isCareer ? 'Read employer sources' : 'Follow the source trace' }}</a>
      </div>
      <p class="scope-note">{{ isCareer ? 'Three employer examples · Two career directions · Plan stage' : 'Five source notes · Five evaluation questions · Plan stage' }}</p>
    </div>
    <div class="evidence-map" :aria-label="isCareer ? 'Research connections' : 'Proposed source-to-answer process'">
      <p class="map-title">{{ isCareer ? 'From responsibility to evidence' : 'From content to a supported answer' }}</p>
      <div class="map-grid">
        <a v-for="(node, index) in mapNodes" :key="node.title" :class="'map-node node-' + index" :href="pageUrl(node.link)">{{ node.title }}</a>
        <div class="map-center"><strong>{{ isCareer ? 'My next role' : 'Source support' }}</strong><span>{{ isCareer ? 'Provisional direction' : 'Evidence to verify' }}</span></div>
      </div>
      <p class="map-caption">{{ isCareer ? 'Open a connection to inspect its evidence.' : 'The complete app journey is planned.' }}</p>
    </div>
  </section>

  <nav class="evidence-strip" aria-label="Research evidence">
    <strong>Open the evidence</strong>
    <a :href="pageUrl(isCareer ? '/employers' : '/sources')">{{ isCareer ? 'Employer postings' : 'Source manifest' }}</a>
    <a :href="pageUrl(isCareer ? '/checks' : '/evaluation')">Checks and limits</a>
    <a href="https://github.com/Sathvik-Alla/is373-career-research/blob/main/PROJECT_RECORD.md">Combined Individual Plan</a>
  </nav>

  <section id="explore" class="research-explorer" aria-labelledby="explore-title">
    <div class="section-heading"><div><p class="kicker">Choose a starting point</p><h2 id="explore-title">{{ isCareer ? 'What would you like to inspect?' : 'What makes the answer trustworthy?' }}</h2></div><p>Choose a topic to see the decision behind it.</p></div>
    <div class="choice-grid">
      <button v-for="item in choices" :key="item.id" type="button" :aria-pressed="selected === item.id" @click="selected = selected === item.id ? '' : item.id"><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></button>
    </div>
    <div v-if="active" class="choice-detail" aria-live="polite"><h3>{{ active.title }}</h3><p>{{ active.result }}</p><a :href="pageUrl(active.link)">Read this section</a></div>
  </section>

  <section class="next-step">
    <div><p class="kicker">Put the research into practice</p><h2>{{ isCareer ? 'Make one capability visible.' : 'Test one complete journey.' }}</h2><p>{{ isCareer ? 'A hiring reader should find the role, open an artifact, and understand my contribution.' : 'An answer should point to the passage that supports it and identify missing evidence.' }}</p></div>
    <div><a :href="pageUrl(isCareer ? '/portfolio' : '/evaluation')">{{ isCareer ? 'Open the portfolio plan' : 'Open the evaluation plan' }}</a><p>{{ isCareer ? 'The group case-study link and peer feedback are pending.' : 'The keyword experiment has run. App retrieval and generation are next.' }}</p></div>
  </section>
</main>
</template>
