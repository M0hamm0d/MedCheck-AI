<template>
  <div class="empty-state">
    <div class="empty-state__icon">{{ icon }}</div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '🔍' },
  title: { type: String, default: 'No results found' },
  message: { type: String, default: 'Try adjusting your search or check the spelling.' },
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12) var(--space-4);
  animation: fadeIn 0.3s ease-out;
}

.empty-state__icon {
  font-size: 3rem;
  margin-bottom: var(--space-6);
}

.empty-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.empty-state__message {
  max-width: 360px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
