<template>
  <article class="medicine-card">
    <div class="medicine-card__header">
      <div class="medicine-card__title-row">
        <span class="medicine-card__icon" aria-hidden="true">💊</span>
        <div>
          <h2 class="medicine-card__brand">{{ medicine.brandName }}</h2>
          <p class="medicine-card__generic">{{ medicine.genericName }}</p>
        </div>
      </div>
      <span class="medicine-card__badge">{{ medicine.category }}</span>
    </div>

    <section class="medicine-card__section">
      <h3 class="medicine-card__section-title">
        <span class="medicine-card__section-icon" aria-hidden="true">📋</span>
        Purpose
      </h3>
      <p class="medicine-card__text">{{ medicine.purpose }}</p>
    </section>

    <section class="medicine-card__section">
      <h3 class="medicine-card__section-title">
        <span class="medicine-card__section-icon" aria-hidden="true">💡</span>
        How to Take
      </h3>
      <p class="medicine-card__text">{{ medicine.dosage }}</p>
    </section>

    <section class="medicine-card__section">
      <h3 class="medicine-card__section-title medicine-card__section-title--warning">
        <span class="medicine-card__section-icon" aria-hidden="true">⚠️</span>
        Possible Side Effects
      </h3>
      <ul class="medicine-card__list">
        <li v-for="(effect, i) in medicine.sideEffects" :key="i" class="medicine-card__list-item">
          {{ effect }}
        </li>
      </ul>
    </section>

    <section class="medicine-card__section medicine-card__warnings">
      <h3 class="medicine-card__section-title medicine-card__section-title--danger">
        <span class="medicine-card__section-icon" aria-hidden="true">🛡️</span>
        Important Warnings
      </h3>
      <ul class="medicine-card__list">
        <li v-for="(warning, i) in medicine.warnings" :key="i" class="medicine-card__list-item medicine-card__list-item--warning">
          {{ warning }}
        </li>
      </ul>
    </section>

    <footer class="medicine-card__disclaimer">
      <svg class="medicine-card__disclaimer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>This information is educational only. Always consult your doctor or pharmacist before taking any medicine.</p>
    </footer>
  </article>
</template>

<script setup>
defineProps({
  medicine: { type: Object, required: true },
})
</script>

<style scoped>
.medicine-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: cardEnter 0.4s ease-out;
}

.medicine-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.medicine-card__title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.medicine-card__icon {
  font-size: 1.5rem;
  line-height: 1;
  margin-top: 2px;
}

.medicine-card__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.medicine-card__generic {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.medicine-card__badge {
  flex-shrink: 0;
  padding: var(--space-1) var(--space-3);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.medicine-card__section {
  padding: var(--space-4) var(--space-6);
}

.medicine-card__section:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border);
}

.medicine-card__section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.medicine-card__section-title--warning {
  color: var(--color-warning);
}

.medicine-card__section-title--danger {
  color: var(--color-danger);
}

.medicine-card__section-icon {
  font-size: 1rem;
}

.medicine-card__text {
  font-size: 0.938rem;
  color: var(--color-text);
  line-height: 1.65;
}

.medicine-card__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.medicine-card__list-item {
  position: relative;
  padding-left: var(--space-5);
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.5;
}

.medicine-card__list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.medicine-card__list-item--warning::before {
  background: var(--color-danger);
}

.medicine-card__warnings {
  background: var(--color-danger-light);
}

.medicine-card__disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--color-warning-light);
  border-top: 1px solid var(--color-warning);
}

.medicine-card__disclaimer-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-warning);
  margin-top: 1px;
}

.medicine-card__disclaimer p {
  font-size: 0.813rem;
  color: var(--color-text);
  line-height: 1.5;
}
</style>
