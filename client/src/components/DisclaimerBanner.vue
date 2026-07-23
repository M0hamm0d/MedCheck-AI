<template>
  <aside class="disclaimer" role="alert">
    <div class="disclaimer__inner">
      <svg class="disclaimer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p class="disclaimer__text">
        <strong>MedSafe AI is an educational tool only.</strong>
        It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
      </p>
    </div>
  </aside>
</template>

<script setup>
</script>

<style scoped>
.disclaimer {
  background: var(--color-warning-light);
  border-bottom: 1px solid var(--color-warning);
}

.disclaimer__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.disclaimer__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--color-warning);
  margin-top: 2px;
}

.disclaimer__text {
  font-size: 0.813rem;
  color: var(--color-text);
  line-height: 1.5;
}

.disclaimer__text strong {
  font-weight: 600;
  color: var(--color-warning);
}
</style>
