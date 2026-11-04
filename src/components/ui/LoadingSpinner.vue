<script setup></script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner">
      <div class="spinner-ball" style="animation-delay: 0s"></div>
      <div class="spinner-ball" style="animation-delay: 0.2s"></div>
      <div class="spinner-ball" style="animation-delay: 0.4s"></div>
      <div class="spinner-ball" style="animation-delay: 0.6s"></div>
      <div class="spinner-ball" style="animation-delay: 0.8s"></div>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  display: inline-flex;
  gap: var(--space-2);
}

.spinner-ball {
  width: var(--space-4);
  height: var(--space-4);
  background: var(--primary);
  border-radius: 50%;
  animation: spinner-bounce 1.2s ease-in-out infinite;
}

@keyframes spinner-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
