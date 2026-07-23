<template>
  <div class="error-state">
    <div class="error-state__icon">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="24" cy="24" r="20" />
        <line x1="24" y1="14" x2="24" y2="28" />
        <circle cx="24" cy="34" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <h3 class="error-state__title">{{ title }}</h3>
    <p class="error-state__message">{{ message }}</p>
    <button v-if="retry" class="error-state__button" @click="$emit('retry')">
      Try Again
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Something went wrong' },
  message: { type: String, default: 'We could not complete your request. Please try again.' },
  retry: { type: Boolean, default: true },
})

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-10) var(--space-4);
  animation: fadeIn 0.3s ease-out;
}

.error-state__icon {
  width: 64px;
  height: 64px;
  color: var(--color-danger);
  margin-bottom: var(--space-6);
}

.error-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.error-state__message {
  max-width: 360px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

.error-state__button {
  padding: var(--space-3) var(--space-6);
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.error-state__button:hover {
  background: var(--color-primary-dark);
}
</style>
