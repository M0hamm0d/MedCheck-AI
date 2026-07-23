<template>
  <div class="search-bar">
    <form class="search-bar__form" @submit.prevent="$emit('search', query)">
      <div class="search-bar__input-wrapper">
        <svg class="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="search-bar__input"
          :placeholder="placeholder"
          :disabled="disabled"
          aria-label="Search for a medicine"
          @input="$emit('input', query)"
        />
        <button
          v-if="query.length > 0"
          type="button"
          class="search-bar__clear"
          @click="clear"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div v-if="loading" class="search-bar__spinner"></div>
      </div>
      <button type="submit" class="search-bar__button" :disabled="disabled || !query.trim()">
        Search
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  placeholder: { type: String, default: 'Search for a medicine...' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  initialQuery: { type: String, default: '' },
})

const emit = defineEmits(['search', 'input'])

const query = ref('')
const inputRef = ref(null)

function clear() {
  query.value = ''
  inputRef.value?.focus()
  emit('input', '')
}
</script>

<style scoped>
.search-bar {
  width: 100%;
}

.search-bar__form {
  display: flex;
  gap: var(--space-3);
  width: 100%;
}

.search-bar__input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-bar__icon {
  position: absolute;
  left: var(--space-4);
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  pointer-events: none;
  transition: color 0.2s;
}

.search-bar__input {
  width: 100%;
  height: 48px;
  padding: 0 var(--space-12) 0 var(--space-10);
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar__input::placeholder {
  color: var(--color-text-muted);
}

.search-bar__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-bar__input-wrapper:focus-within .search-bar__icon {
  color: var(--color-primary);
}

.search-bar__input:disabled {
  background: var(--color-bg);
  cursor: not-allowed;
}

.search-bar__clear {
  position: absolute;
  right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--color-border);
  border: none;
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.search-bar__clear svg {
  width: 14px;
  height: 14px;
}

.search-bar__clear:hover {
  background: var(--color-text-muted);
  color: var(--color-surface);
}

.search-bar__spinner {
  position: absolute;
  right: var(--space-3);
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.search-bar__button {
  flex-shrink: 0;
  height: 48px;
  padding: 0 var(--space-6);
  font-size: 0.938rem;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
}

.search-bar__button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.search-bar__button:active:not(:disabled) {
  transform: scale(0.97);
}

.search-bar__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .search-bar__form {
    flex-direction: column;
  }

  .search-bar__button {
    width: 100%;
  }
}
</style>
