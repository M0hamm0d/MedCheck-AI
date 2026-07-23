<template>
  <div class="not-found">
    <div class="not-found__content">
      <span class="not-found__code">404</span>
      <h1 class="not-found__title">Page not found</h1>
      <p class="not-found__text">
        The page you are looking for does not exist or has been moved.
      </p>
      <router-link to="/" class="not-found__link">
        Go to Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  animation: fadeIn 0.4s ease-out;
}

.not-found__content {
  text-align: center;
}

.not-found__code {
  display: block;
  font-size: 5rem;
  font-weight: 800;
  color: var(--color-border);
  line-height: 1;
  margin-bottom: var(--space-4);
}

.not-found__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.not-found__text {
  max-width: 400px;
  margin: 0 auto var(--space-6);
  font-size: 0.938rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.not-found__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: 0.938rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background 0.2s;
}

.not-found__link:hover {
  background: var(--color-primary-dark);
}
</style>
