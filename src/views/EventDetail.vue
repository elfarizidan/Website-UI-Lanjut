<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

const route = useRoute()
const router = useRouter()
const { getEventById } = useEvents()

const event = computed(() => getEventById(route.params.id))
</script>

<template>
  <div v-if="event" class="event-detail-page">
    <button @click="router.push('/browse/events')" class="btn-back">&larr; Back to Events</button>

    <div class="detail-header">
      <span class="category-pill">{{ event.cat }}</span>
      <span :class="['status-tag', event.done ? 'status-ended' : 'status-live']">
        {{ event.done ? 'Event Concluded' : 'Open Registration' }}
      </span>
      <h1 class="event-title">{{ event.title }}</h1>
      <p class="event-meta">{{ event.date }} · {{ event.loc }}</p>

      <div class="detail-content grid-asymmetric">
        <div class="main-desc">
          <h2>About This Event</h2>
          <p class="description-text">{{ event.desc }}</p>
        </div>

        <div class="sidebar">
          <AppCard class="ticket-card sticky-pane">
            <h3>Attendee Registration</h3>
            <p class="ticket-desc">Secure your seat now before the quota is full.</p>
            <AppButton :disabled="event.done" variant="primary" class="btn-register">
              {{ event.done ? 'Registration Closed' : `Register Now (${event.price})` }}
            </AppButton>
          </AppCard>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found-card">
    <div class="not-found-icon">🔍</div>
    <h2>Event Not Found</h2>
    <p>The event you are looking for does not exist or has been removed.</p>
    <AppButton variant="primary" @click="router.push('/browse/events')">Back to Events</AppButton>
  </div>
</template>

<style scoped>
.btn-back {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: var(--space-6);
  color: var(--text-muted);
}

.detail-header {
  background: var(--bg-light);
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
  padding: var(--space-12) var(--space-8);
  margin-bottom: var(--space-8);
}

.category-pill {
  display: inline-block;
  background: rgba(102, 68, 255, 0.1);
  padding: var(--space-1) var(--space-4);
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: var(--space-4);
}

.status-tag {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.status-live {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.status-ended {
  background: rgba(102, 112, 133, 0.1);
  color: var(--text-muted);
}

.event-title {
  font-size: 2.8rem;
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.event-meta {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 1.05rem;
}

/* ASYMMETRICAL GRID */
.grid-asymmetric {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-12);
}

.main-desc h2 {
  margin-bottom: var(--space-4);
  font-size: 1.8rem;
  border-left: 4px solid var(--primary);
  padding-left: var(--space-2);
}

.description-text {
  color: var(--text-muted);
  line-height: 1.8;
}

/* FOCAL POINT CARD: box design comes from <AppCard> */
.ticket-card {
  padding: var(--space-8);
  text-align: center;
}

/* STICKY BEHAVIOR */
.sticky-pane {
  position: sticky;
  top: 100px;
}

.ticket-card h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
}

.ticket-desc {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.btn-register {
  width: 100%;
  padding: var(--space-4);
}

.btn-register:disabled {
  background: var(--bg-gray);
  color: var(--text-muted);
  border-color: var(--border-color);
  cursor: not-allowed;
}

.not-found-card {
  background: var(--bg-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--space-4);
  padding: var(--space-12) var(--space-6);
  text-align: center;
  max-width: 400px;
  margin: var(--space-12) auto;
}

.not-found-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.not-found-card h2 {
  font-size: 1.5rem;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.not-found-card p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

@media (max-width: 900px) {
  .grid-asymmetric {
    grid-template-columns: 1fr;
  }
}
</style>
