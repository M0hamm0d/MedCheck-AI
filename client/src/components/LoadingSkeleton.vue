<template>
  <div class="skeleton-card">
    <div class="skeleton-card__header">
      <div class="skeleton__circle skeleton--pulse"></div>
      <div class="skeleton-card__header-text">
        <div class="skeleton__line skeleton__line--lg skeleton--pulse"></div>
        <div class="skeleton__line skeleton__line--md skeleton--pulse"></div>
      </div>
    </div>
    <div v-for="i in 4" :key="i" class="skeleton-card__section">
      <div class="skeleton__line skeleton__line--sm skeleton--pulse"></div>
      <div class="skeleton__line skeleton__line--xl skeleton--pulse"></div>
      <div class="skeleton__line skeleton__line--xl skeleton--pulse" style="width: 70%"></div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.skeleton-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.skeleton-card__header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-card__section {
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-card__section:not(:last-of-type) {
  border-bottom: 1px solid var(--color-border);
}

.skeleton__circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
}

.skeleton__line {
  height: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-border);
}

.skeleton__line--sm {
  width: 100px;
}

.skeleton__line--md {
  width: 60%;
}

.skeleton__line--lg {
  width: 40%;
}

.skeleton__line--xl {
  width: 100%;
}

.skeleton--pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
