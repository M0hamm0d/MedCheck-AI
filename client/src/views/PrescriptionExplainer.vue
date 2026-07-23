<template>
  <div class="prescription-page">
    <section class="prescription-page__hero">
      <h1 class="prescription-page__title">Prescription Explainer</h1>
      <p class="prescription-page__subtitle">
        Paste your prescription instructions and get a plain-English explanation of what they mean.
      </p>
    </section>

    <section class="prescription-page__form">
      <div class="input-card">
        <label class="input-card__label" for="prescription-input">
          Prescription Instructions
        </label>
        <textarea
          id="prescription-input"
          v-model="text"
          class="input-card__textarea"
          placeholder="Paste your prescription instructions here...&#10;&#10;Example: Amoxicillin 500mg, 1 tablet, Three times daily, 7 days"
          :disabled="loading"
          rows="5"
        ></textarea>
        <div class="input-card__footer">
          <span class="input-card__hint">{{ text.length }} / 1000 characters</span>
          <button
            class="input-card__button"
            :disabled="loading || !text.trim()"
            @click="handleTranslate"
          >
            <svg v-if="loading" class="input-card__spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span v-else>Translate to Plain English</span>
          </button>
        </div>
      </div>
    </section>

    <section v-if="loading" class="prescription-page__result">
      <div class="result-card result-card--loading">
        <div class="skeleton-line skeleton-line--sm skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--xl skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--lg skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--sm skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--xl skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--lg skeleton--pulse"></div>
      </div>
    </section>

    <section v-else-if="error" class="prescription-page__result">
      <div class="error-box">
        <svg class="error-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 class="error-box__title">Could not translate</h3>
        <p class="error-box__message">{{ error }}</p>
        <button class="error-box__retry" @click="handleTranslate">Try Again</button>
      </div>
    </section>

    <section v-else-if="result && result.uninterpretable" class="prescription-page__result">
      <div class="unclear-card">
        <svg class="unclear-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <h3 class="unclear-card__title">Unclear Prescription</h3>
        <p class="unclear-card__text">
          We could not interpret these instructions. Please try providing clearer details such as the medicine name, dosage, how often to take it, and for how long.
        </p>
      </div>
    </section>

    <section v-else-if="result && result.sections" class="prescription-page__result">
      <div class="result-card">
        <div class="result-card__section" v-if="result.sections.frequency">
          <h3 class="result-card__section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            How Often
          </h3>
          <p class="result-card__section-text">{{ result.sections.frequency }}</p>
        </div>

        <div class="result-card__section" v-if="result.sections.duration">
          <h3 class="result-card__section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            How Long
          </h3>
          <p class="result-card__section-text">{{ result.sections.duration }}</p>
        </div>

        <div class="result-card__section" v-if="result.sections.storage">
          <h3 class="result-card__section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Storage
          </h3>
          <p class="result-card__section-text">{{ result.sections.storage }}</p>
        </div>

        <div class="result-card__section result-card__section--warnings" v-if="result.sections.warnings">
          <h3 class="result-card__section-title result-card__section-title--warnings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Important
          </h3>
          <p class="result-card__section-text">{{ result.sections.warnings }}</p>
        </div>

        <div v-if="result.disclaimer" class="result-card__disclaimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{{ result.disclaimer }}</p>
        </div>
      </div>
    </section>

    <section v-if="!result && !loading && !error" class="prescription-page__examples">
      <h3 class="prescription-page__examples-title">Try an example</h3>
      <div class="prescription-page__example-tags">
        <button
          v-for="example in examples"
          :key="example"
          class="prescription-page__example-tag"
          @click="text = example; handleTranslate()"
        >
          {{ example }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api.js'

const text = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const examples = [
  'Amoxicillin 500mg, 1 tablet, Three times daily, 7 days',
  '1 tab BID PC x 7d',
  'Take one tablet twice daily after meals for 10 days',
]

async function handleTranslate() {
  if (!text.value.trim() || loading.value) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await api.post('/medicine/prescription', {
      text: text.value,
    })
    result.value = response.data
  } catch (err) {
    error.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.prescription-page {
  animation: fadeIn 0.4s ease-out;
}

.prescription-page__hero {
  text-align: center;
  padding-bottom: var(--space-10);
}

.prescription-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.prescription-page__subtitle {
  max-width: 480px;
  margin: 0 auto;
  font-size: 0.938rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.prescription-page__form {
  max-width: 640px;
  margin: 0 auto;
}

.input-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.input-card__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.input-card__textarea {
  width: 100%;
  min-height: 120px;
  padding: var(--space-4);
  font-size: 0.938rem;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  line-height: 1.6;
}

.input-card__textarea::placeholder {
  color: var(--color-text-muted);
}

.input-card__textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input-card__textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.input-card__hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.input-card__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
}

.input-card__button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.input-card__button:active:not(:disabled) {
  transform: scale(0.97);
}

.input-card__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-card__spinner {
  width: 18px;
  height: 18px;
  color: #fff;
  animation: spin 1s linear infinite;
}

.prescription-page__result {
  max-width: 640px;
  margin: var(--space-8) auto 0;
}

.result-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: cardEnter 0.4s ease-out;
}

.result-card--loading {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.result-card__section {
  padding: var(--space-4) var(--space-6);
}

.result-card__section:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border);
}

.result-card__section--warnings {
  background: var(--color-warning-light);
}

.result-card__section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.result-card__section-title svg {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.result-card__section-title--warnings {
  color: var(--color-warning);
}

.result-card__section-title--warnings svg {
  color: var(--color-warning);
}

.result-card__section-text {
  font-size: 0.938rem;
  color: var(--color-text);
  line-height: 1.65;
}

.result-card__disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--color-info-light);
  border-top: 1px solid var(--color-primary-light);
}

.result-card__disclaimer svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.result-card__disclaimer p {
  font-size: 0.813rem;
  color: var(--color-text);
  line-height: 1.5;
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-border);
}

.skeleton-line--sm { width: 120px; }
.skeleton-line--lg { width: 65%; }
.skeleton-line--xl { width: 100%; }

.skeleton--pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: cardEnter 0.3s ease-out;
}

.error-box__icon {
  width: 48px;
  height: 48px;
  color: var(--color-danger);
  margin-bottom: var(--space-4);
}

.error-box__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.error-box__message {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
  max-width: 360px;
  line-height: 1.5;
}

.error-box__retry {
  padding: var(--space-2) var(--space-6);
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.error-box__retry:hover {
  background: var(--color-primary-dark);
}

.unclear-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-lg);
  animation: cardEnter 0.3s ease-out;
}

.unclear-card__icon {
  width: 48px;
  height: 48px;
  color: var(--color-warning);
  margin-bottom: var(--space-4);
}

.unclear-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.unclear-card__text {
  max-width: 400px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.prescription-page__examples {
  max-width: 640px;
  margin: var(--space-8) auto 0;
  text-align: center;
}

.prescription-page__examples-title {
  font-size: 0.812rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.prescription-page__example-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.prescription-page__example-tag {
  padding: var(--space-2) var(--space-4);
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-info-light);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.prescription-page__example-tag:hover {
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

@media (min-width: 640px) {
  .prescription-page__title {
    font-size: 2.25rem;
  }
}
</style>
