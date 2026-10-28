<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEvents } from '@/composables/useEvents'

const router = useRouter()
const route = useRoute()
const { getEventById, getRegistrationByEventId, userRegistrations, activeEvents } = useEvents()

const activeTicket = ref(null)

watch(
  route,
  (to) => {
    const id = to.params.id ? Number(to.params.id) : null
    if (id) {
      activeTicket.value = getRegistrationByEventId(id) || null
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="activeTicket" class="ticket-receipt-page">
    <div class="ticket-header">
      <AppButton variant="primary" @click="router.push('/your-events')"
        >Back to Your Events</AppButton
      >
    </div>

    <div class="ticket-card">
      <div>
        <span class="ticket-success">CONFIRMED PASS</span>
        <span class="ticket-code">#{{ activeTicket?.bookingCode }}</span>
      </div>

      <div class="ticket-info">
        <div class="ticket-row">
          <span class="ticket-label">Event</span>
          <span class="ticket-value">{{ activeTicket?.eventTitle }}</span>
        </div>

        <div class="ticket-row">
          <span class="ticket-label">Date</span>
          <span class="ticket-value">{{ activeTicket?.eventDate }}</span>
        </div>

        <div class="ticket-row">
          <span class="ticket-label">Location</span>
          <span class="ticket-value">{{ activeTicket?.eventLoc }}</span>
        </div>

        <div class="ticket-row">
          <span class="ticket-label">Attendee</span>
          <span class="ticket-value">{{ activeTicket?.fullName }}</span>
        </div>

        <div class="ticket-row">
          <span class="ticket-label">Reason</span>
          <span class="ticket-value">{{ activeTicket?.reason }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found-card">
    <div class="not-found-icon">🔍</div>
    <h2>Ticket Not Found</h2>
    <p>The ticket you are looking for does not exist or has been removed.</p>
    <AppButton variant="primary" @click="router.push('/your-events')"
      >Back to Your Events</AppButton
    >
  </div>
</template>

<style scoped>
.ticket-receipt-page {
  max-width: 800px;
  margin: var(--space-8) auto;
  padding: var(--space-8);
}

.ticket-header {
  margin-bottom: var(--space-8);
}

.ticket-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--space-4);
  padding: var(--space-8);
  text-align: center;
  box-shadow: 0 4px 20px rgba(2, 0, 2, 0.03);
}

.ticket-success {
  color: #15803d;
  font-weight: 500;
  margin-bottom: var(--space-6);
  display: inline-block;
}

.ticket-code {
  font-family: monospace;
  font-size: 1.5rem;
  color: var(--primary);
  background: rgba(102, 68, 255, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: var(--space-6);
  display: inline-block;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: var(--text-main);
}

.ticket-label {
  color: var(--text-muted);
  font-weight: 500;
}

.ticket-value {
  color: var(--text-main);
}

.not-found-card {
  background: var(--bg-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--space-4);
  padding: var(--space-12) var(--space-6);
  text-align: center;
  max-width: 400px;
  margin: var(--space-8) auto;
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
</style>
