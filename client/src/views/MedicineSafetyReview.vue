<template>
  <div class="safety-page">
    <section class="safety-page__hero" aria-label="Safety Review">
      <h1 class="safety-page__title">Medicine Safety Review</h1>
      <p class="safety-page__subtitle">
        Check how two medicines might interact and understand potential risks.
        Always consult your doctor before combining medicines.
      </p>
    </section>

    <section class="safety-page__form" aria-label="Enter medicines to check">
      <div class="two-inputs">
        <div class="drug-input">
          <label class="drug-input__label" for="drug-a">Medicine A</label>
          <input
            id="drug-a"
            v-model="drugA"
            type="text"
            class="drug-input__field"
            placeholder="Enter a medicine name..."
            :disabled="loading"
            @keyup.enter="handleCheck"
          />
        </div>
        <div class="two-inputs__divider">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
            <polyline points="12 5 19 12 12 19" transform="translate(-14, 0)" />
          </svg>
        </div>
        <div class="drug-input">
          <label class="drug-input__label" for="drug-b">Medicine B</label>
          <input
            id="drug-b"
            v-model="drugB"
            type="text"
            class="drug-input__field"
            placeholder="Enter a medicine name..."
            :disabled="loading"
            @keyup.enter="handleCheck"
          />
        </div>
      </div>

      <button
        class="check-btn"
        :disabled="loading || !drugA.trim() || !drugB.trim()"
        @click="handleCheck"
      >
        <svg v-if="loading" class="check-btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <span v-else>Check Interactions</span>
      </button>
    </section>

    <section class="safety-page__result" aria-live="polite">
      <div v-if="loading" class="result-card result-card--loading">
        <div class="skeleton-line skeleton-line--sm skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--xl skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--lg skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--sm skeleton--pulse"></div>
        <div class="skeleton-line skeleton-line--xl skeleton--pulse"></div>
      </div>

      <div v-else-if="error" class="error-box">
        <svg class="error-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 class="error-box__title">Could not check interactions</h3>
        <p class="error-box__message">{{ error }}</p>
        <button class="error-box__retry" @click="handleCheck">Try Again</button>
      </div>

      <div v-else-if="result && !result.found" class="not-found-card">
        <svg class="not-found-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <h3 class="not-found-card__title">Medicine not found</h3>
        <p class="not-found-card__text">
          {{ result.missing && result.missing.length === 2 ? `We could not find "${result.missing[0]}" or "${result.missing[1]}" in the database.` : `We could not find "${result.missing && result.missing[0]}" in the database.` }}
          Please check the spelling or try the generic name.
        </p>
      </div>

      <div v-else-if="result && result.found && result.result" class="result-card">
        <div class="result-card__drugs">
          <span class="result-card__drug-tag">{{ result.drugA.brandName }}</span>
          <svg class="result-card__plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span class="result-card__drug-tag">{{ result.drugB.brandName }}</span>
        </div>

        <div class="result-card__section" v-if="result.result.safetySummary">
          <h3 class="result-card__section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Safety Summary
          </h3>
          <p class="result-card__section-text">{{ result.result.safetySummary }}</p>
        </div>

        <div class="result-card__section result-card__section--concern" v-if="result.result.potentialConcerns">
          <h3 class="result-card__section-title result-card__section-title--warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Potential Concerns
          </h3>
          <p class="result-card__section-text">{{ result.result.potentialConcerns }}</p>
        </div>

        <div class="result-card__section" v-if="result.result.professionalAdvice">
          <h3 class="result-card__section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Professional Advice
          </h3>
          <p class="result-card__section-text">{{ result.result.professionalAdvice }}</p>
        </div>

        <div v-if="result.disclaimer" class="result-card__disclaimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{{ result.disclaimer }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api.js'

const drugA = ref('')
const drugB = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

async function handleCheck() {
  if (!drugA.value.trim() || !drugB.value.trim() || loading.value) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await api.post('/medicine/interactions', {
      drugA: drugA.value,
      drugB: drugB.value,
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
.safety-page {
  animation: fadeIn 0.4s ease-out;
}

.safety-page__hero {
  text-align: center;
  padding-bottom: var(--space-10);
}

.safety-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.safety-page__subtitle {
  max-width: 520px;
  margin: 0 auto;
  font-size: 0.938rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.safety-page__form {
  max-width: 640px;
  margin: 0 auto;
}

.two-inputs {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
}

.drug-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.drug-input__label {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-text);
}

.drug-input__field {
  height: 48px;
  padding: 0 var(--space-4);
  font-size: 0.938rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.drug-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.drug-input__field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drug-input__field::placeholder {
  color: var(--color-text-muted);
}

.two-inputs__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: var(--space-1);
}

.two-inputs__divider svg {
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.check-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-6);
  font-size: 0.938rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.check-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.check-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.check-btn__spinner {
  width: 18px;
  height: 18px;
  color: #fff;
  animation: spin 1s linear infinite;
}

.safety-page__result {
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

.result-card__drugs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.result-card__drug-tag {
  padding: var(--space-2) var(--space-4);
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
}

.result-card__plus {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.result-card__section {
  padding: var(--space-4) var(--space-6);
}

.result-card__section:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border);
}

.result-card__section--concern {
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

.result-card__section-title--warning {
  color: var(--color-warning);
}

.result-card__section-title--warning svg {
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

.skeleton--pulse { animation: pulse 1.5s ease-in-out infinite; }

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
  transition: background 0.2s;
}

.error-box__retry:hover {
  background: var(--color-primary-dark);
}

.not-found-card {
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

.not-found-card__icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.not-found-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.not-found-card__text {
  max-width: 400px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 480px) {
  .two-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .two-inputs__divider {
    padding-bottom: 0;
    padding-top: var(--space-2);
  }

  .two-inputs__divider svg {
    transform: rotate(90deg);
  }
}

@media (min-width: 640px) {
  .safety-page__title {
    font-size: 2.25rem;
  }
}
</style>
