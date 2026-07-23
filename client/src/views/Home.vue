<template>
  <div class="home">
    <section class="hero" aria-label="Introduction">
      <div class="hero__badge">
        <span class="hero__badge-dot" aria-hidden="true"></span>
        AI-Powered Medicine Safety
      </div>
      <h1 class="hero__title">Understand Your Medicines<br />Clearly and Safely</h1>
      <p class="hero__subtitle">
        MedSafe AI explains medicines, side effects, and prescriptions in plain language.
        Educational information you can trust — always backed by real drug data.
      </p>
      <router-link to="/search" class="hero__cta">
        Search a Medicine
        <svg class="hero__cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </router-link>
    </section>

    <section class="features" aria-label="Features">
      <router-link to="/search" class="feature-card">
        <div class="feature-card__icon-box feature-card__icon-box--blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <h2 class="feature-card__title">Medicine Search</h2>
        <p class="feature-card__desc">
          Search any medicine and get a clear explanation of its purpose, side effects, and warnings.
        </p>
        <span class="feature-card__link">Learn more &rarr;</span>
      </router-link>

      <router-link to="/safety" class="feature-card">
        <div class="feature-card__icon-box feature-card__icon-box--amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 class="feature-card__title">Safety Review</h2>
        <p class="feature-card__desc">
          Check how two medicines might interact and understand any potential risks or side effects.
        </p>
        <span class="feature-card__link">Learn more &rarr;</span>
      </router-link>

      <router-link to="/prescription" class="feature-card">
        <div class="feature-card__icon-box feature-card__icon-box--green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 class="feature-card__title">Prescription Explainer</h2>
        <p class="feature-card__desc">
          Paste prescription instructions like "1 tab BID" and get them in plain, easy-to-understand English.
        </p>
        <span class="feature-card__link">Learn more &rarr;</span>
      </router-link>
    </section>

    <section class="trust" aria-label="How it works">
      <div class="trust__card">
        <h2 class="trust__title">How It Works</h2>
        <div class="trust__steps">
          <div class="trust__step">
            <span class="trust__step-number">1</span>
            <div>
              <h3 class="trust__step-title">Search</h3>
              <p class="trust__step-desc">Look up a medicine by brand or generic name.</p>
            </div>
          </div>
          <div class="trust__step">
            <span class="trust__step-number">2</span>
            <div>
              <h3 class="trust__step-title">Retrieve</h3>
              <p class="trust__step-desc">We pull official drug data from the OpenFDA database.</p>
            </div>
          </div>
          <div class="trust__step">
            <span class="trust__step-number">3</span>
            <div>
              <h3 class="trust__step-title">Explain</h3>
              <p class="trust__step-desc">AI simplifies the information into plain, clear language.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  animation: fadeIn 0.4s ease-out;
}

.hero {
  text-align: center;
  padding: var(--space-10) 0 var(--space-12);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-4);
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
}

.hero__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 2s ease-in-out infinite;
}

.hero__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.25;
  margin-bottom: var(--space-4);
}

.hero__subtitle {
  max-width: 560px;
  margin: 0 auto var(--space-8);
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.65;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-8);
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}

.hero__cta:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.hero__cta:active {
  transform: scale(0.97);
}

.hero__cta-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
}

.hero__cta:hover .hero__cta-arrow {
  transform: translateX(3px);
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-12);
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
  border-color: var(--color-primary-light);
}

.feature-card__icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
}

.feature-card__icon-box svg {
  width: 22px;
  height: 22px;
}

.feature-card__icon-box--blue {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.feature-card__icon-box--amber {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.feature-card__icon-box--green {
  color: var(--color-success);
  background: var(--color-success-light);
}

.feature-card__title {
  font-size: 1.063rem;
  font-weight: 600;
  color: var(--color-text);
}

.feature-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.feature-card__link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  margin-top: auto;
}

.trust {
  margin-bottom: var(--space-8);
}

.trust__card {
  padding: var(--space-8) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.trust__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-8);
}

.trust__steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.trust__step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.trust__step-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 50%;
}

.trust__step-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.trust__step-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

@media (min-width: 640px) {
  .hero__title {
    font-size: 2.5rem;
  }

  .features {
    grid-template-columns: repeat(3, 1fr);
  }

  .trust__steps {
    flex-direction: row;
  }

  .trust__step {
    flex: 1;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}
</style>
