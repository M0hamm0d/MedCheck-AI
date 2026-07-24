<template>
  <div class="search-page">
    <section class="search-page__hero">
      <h1 class="search-page__title">Medicine Search</h1>
      <p class="search-page__subtitle">
        Look up any medicine and get a clear, plain-language explanation of what it does, how to
        take it, and what to watch out for.
      </p>
      <SearchBar :loading="isSearching" @search="handleSearch" @input="handleInput" />
    </section>

    <section class="search-page__results" aria-live="polite">
      <LoadingSkeleton v-if="isSearching" />

      <EmptyState
        v-else-if="hasSearched && results.length === 0"
        icon="🔍"
        title="No medicines found"
        :message="emptyMessage"
      />

      <ErrorState
        v-else-if="error"
        :title="error.title"
        :message="error.message"
        :retry="true"
        @retry="handleSearch(lastQuery)"
      />

      <TransitionGroup
        v-else-if="results.length > 0"
        name="results"
        tag="div"
        class="search-page__cards"
      >
        <div v-for="med in results" :key="med.id" class="search-page__card-wrapper">
          <MedicineCard :medicine="med" class="search-page__card" />

          <div class="search-page__explain-area">
            <button v-if="explainingId !== med.id" class="explain-btn" @click="handleExplain(med)">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Explain this medicine
            </button>

            <div v-if="explainingId === med.id && explainError" class="explain-error">
              <span>{{ explainError }}</span>
              <button class="explain-error__retry" @click="handleExplain(med)">Retry</button>
            </div>

            <LoadingSkeleton v-if="explainingId === med.id && isExplaining" />

            <div v-if="explainingId === med.id && explanationMap[med.id]" class="explanation-card">
              <div class="explanation-card__section" v-if="explanationMap[med.id].uses">
                <h3 class="explanation-card__section-title">Uses</h3>
                <p class="explanation-card__section-text">{{ explanationMap[med.id].uses }}</p>
              </div>

              <div class="explanation-card__section" v-if="explanationMap[med.id].warnings">
                <h3 class="explanation-card__section-title explanation-card__section-title--warn">
                  Warnings
                </h3>
                <p class="explanation-card__section-text">{{ explanationMap[med.id].warnings }}</p>
              </div>

              <div class="explanation-card__section" v-if="explanationMap[med.id].sideEffects">
                <h3 class="explanation-card__section-title">Side Effects</h3>
                <p class="explanation-card__section-text">
                  {{ explanationMap[med.id].sideEffects }}
                </p>
              </div>

              <div class="explanation-card__section" v-if="explanationMap[med.id].storage">
                <h3 class="explanation-card__section-title">Storage</h3>
                <p class="explanation-card__section-text">{{ explanationMap[med.id].storage }}</p>
              </div>

              <div class="explanation-card__section" v-if="explanationMap[med.id].contactHcp">
                <h3 class="explanation-card__section-title">When to Contact a Doctor</h3>
                <p class="explanation-card__section-text">
                  {{ explanationMap[med.id].contactHcp }}
                </p>
              </div>

              <div v-if="explanationDisclaimers[med.id]" class="explanation-card__disclaimer">
                <p>{{ explanationDisclaimers[med.id] }}</p>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="!hasSearched && !isSearching && !error" class="search-page__suggestions">
        <h3 class="search-page__suggestions-title">Try searching for</h3>
        <div class="search-page__suggestion-tags">
          <button
            v-for="tag in suggestions"
            :key="tag"
            class="search-page__suggestion-tag"
            @click="handleSearch(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import SearchBar from '../components/SearchBar.vue'
import MedicineCard from '../components/MedicineCard.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import api from '../services/api.js'

const results = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)
const lastQuery = ref('')
const error = ref(null)

const explainingId = ref(null)
const isExplaining = ref(false)
const explainError = ref('')
const explanationMap = reactive({})
const explanationDisclaimers = reactive({})

const suggestions = ['Ibuprofen', 'Amoxicillin', 'Aspirin']

const emptyMessage = computed(() => {
  return `We could not find any results for "${lastQuery.value}". Try the generic name or check the spelling.`
})

async function handleSearch(query) {
  if (!query || !query.trim()) return

  lastQuery.value = query.trim()
  error.value = null
  isSearching.value = true
  hasSearched.value = true
  explainingId.value = null
  explainError.value = ''

  try {
    const { data } = await api.get('/medicine/search', {
      params: { q: lastQuery.value },
    })
    results.value = data.results || []
  } catch (err) {
    error.value = {
      title: 'Search error',
      message: err.message || 'Something went wrong while searching. Please try again.',
    }
    results.value = []
  } finally {
    isSearching.value = false
  }
}

async function handleExplain(drug) {
  if (explanationMap[drug.id]) {
    explainingId.value = explainingId.value === drug.id ? null : drug.id
    return
  }

  explainingId.value = drug.id
  isExplaining.value = true
  explainError.value = ''

  try {
    const { data } = await api.post('/medicine/explain', { drug })
    explanationMap[drug.id] = data.explanation || {}
    if (data.disclaimer) {
      explanationDisclaimers[drug.id] = data.disclaimer
    }
  } catch (err) {
    explainError.value = err.message || 'Could not explain this medicine.'
  } finally {
    isExplaining.value = false
  }
}

function handleInput() {
  error.value = null
}
</script>

<style scoped>
.search-page__hero {
  text-align: center;
  padding-bottom: var(--space-10);
}

.search-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.search-page__subtitle {
  max-width: 520px;
  margin: 0 auto var(--space-8);
  font-size: 0.938rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.search-page__results {
  min-height: 200px;
}

.search-page__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-page__card-wrapper {
  animation: cardEnter 0.4s ease-out;
}

.search-page__card {
  width: 100%;
}

.search-page__explain-area {
  margin-top: var(--space-3);
}

.explain-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-info-light);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.15s;
}

.explain-btn:hover {
  background: var(--color-primary-light);
}

.explain-btn svg {
  width: 14px;
  height: 14px;
}

.explain-error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: 0.813rem;
  color: var(--color-danger);
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
}

.explain-error__retry {
  padding: var(--space-1) var(--space-3);
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-danger);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.explanation-card {
  margin-top: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.explanation-card__section {
  padding: var(--space-3) var(--space-4);
}

.explanation-card__section:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border);
}

.explanation-card__section-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.explanation-card__section-title--warn {
  color: var(--color-warning);
}

.explanation-card__section-text {
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.55;
}

.explanation-card__disclaimer {
  padding: var(--space-3) var(--space-4);
  background: var(--color-info-light);
  border-top: 1px solid var(--color-primary-light);
}

.explanation-card__disclaimer p {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.search-page__suggestions {
  text-align: center;
  padding: var(--space-8) 0;
}

.search-page__suggestions-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.search-page__suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.search-page__suggestion-tag {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-info-light);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
}

.search-page__suggestion-tag:hover {
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

.results-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.results-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
}

.results-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.results-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (min-width: 640px) {
  .search-page__title {
    font-size: 2.25rem;
  }
}
</style>
