<template>
  <div class="layout">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <DisclaimerBanner />

    <header class="header">
      <div class="header__inner">
        <router-link to="/" class="header__logo">
          <svg class="header__logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.91 8.84C20.37 4.39 16.63 1 12 1S3.63 4.39 3.09 8.84" />
            <path d="M12 2v4" />
            <path d="M7.5 7.5l-3 3" />
            <path d="M16.5 7.5l3 3" />
            <line x1="12" y1="22" x2="12" y2="18" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
          MedSafe AI
        </router-link>
        <nav class="header__nav" aria-label="Main navigation">
          <router-link to="/search" class="header__link" active-class="header__link--active">
            <span class="header__link-full">Medicine Search</span>
            <span class="header__link-short">Search</span>
          </router-link>
          <router-link to="/safety" class="header__link" active-class="header__link--active">
            <span class="header__link-full">Safety Review</span>
            <span class="header__link-short">Safety</span>
          </router-link>
          <router-link to="/prescription" class="header__link" active-class="header__link--active">
            <span class="header__link-full">Prescription</span>
            <span class="header__link-short">Rx</span>
          </router-link>
        </nav>
        <span v-if="isDemoMode" class="header__demo-badge" role="status" aria-label="Demo mode active">
          <span class="header__demo-dot" aria-hidden="true"></span>
          Demo
        </span>
      </div>
    </header>

    <main class="main" id="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer" role="contentinfo">
      <div class="footer__inner">
        <p class="footer__text">
          MedSafe AI is an educational tool only. It does not provide medical advice, diagnosis, or treatment.
          Always consult a qualified healthcare professional before taking any medicine.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DisclaimerBanner from '../components/DisclaimerBanner.vue'
import api from '../services/api.js'

const isDemoMode = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/health')
    isDemoMode.value = data.demoMode === true
  } catch {
    isDemoMode.value = false
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-4);
  min-height: 64px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.header__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.header__logo-icon {
  width: 26px;
  height: 26px;
}

.header__nav {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.header__link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s, background-color 0.15s;
  white-space: nowrap;
}

.header__link:hover {
  color: var(--color-text);
  background-color: var(--color-bg);
}

.header__link--active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.header__link-full {
  display: inline;
}

.header__link-short {
  display: none;
}

.header__demo-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success);
  background: var(--color-success-light);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.header__demo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 2s ease-in-out infinite;
}

@media (max-width: 480px) {
  .header__inner {
    justify-content: center;
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }

  .header__link-full {
    display: none;
  }

  .header__link-short {
    display: inline;
  }
}

.main {
  flex: 1;
  max-width: var(--max-width);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.main:focus {
  outline: none;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.footer__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.footer__text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
