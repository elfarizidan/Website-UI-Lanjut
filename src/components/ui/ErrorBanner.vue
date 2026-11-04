<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: 'Terjadi kesalahan',
  },
  onRetry: {
    type: Function,
    default: () => {},
  },
})
</script>

<template>
  <div v-if="isOpen" class="error-banner">
    <div class="error-banner-content">
      <div class="error-icon">⚠</div>
      <p class="error-message">{{ errorMessage }}</p>
      <button class="btn-retry" @click="onRetry">Coba Lagi</button>
    </div>
  </div>
</template>

<style scoped>
.error-banner {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  background: #ffe3e3;
  border: 1px solid #ffa8a8;
  border-radius: var(--space-4);
  padding: var(--space-4) var(--space-6);
  z-index: 9999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.15);
}

.error-banner-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-icon {
  font-size: 1.5rem;
}

.error-message {
  color: #c92a2a;
  font-size: 0.95rem;
  flex: 1;
}

.btn-retry {
  background: transparent;
  border: none;
  color: #c92a2a;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.btn-retry:hover {
  color: #a91818;
}
</style>
