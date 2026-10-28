<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'

const router = useRouter()
const { userRegistrations, getEventById, cancelRegistration } = useEvents()
const selectedRegistration = ref(null)
const isCancelModalOpen = ref(false)

const tickets = computed(() =>
  userRegistrations.value
    .map((registration) => ({
      ...registration,
      event: getEventById(registration.eventId),
    }))
    .filter((registration) => registration.event),
)

const handleConfirmCancel = () => {
  if (selectedRegistration.value) cancelRegistration(selectedRegistration.value.eventId)
  isCancelModalOpen.value = false
  selectedRegistration.value = null
}

const handleOpenCancel = (ticket) => {
  selectedRegistration.value = ticket
  isCancelModalOpen.value = true
}

const handleCloseCancel = () => {
  isCancelModalOpen.value = false
  selectedRegistration.value = null
}
</script>

<template>
  <div class="your-events-page">
    <header class="page-header">
      <h1>Your Events</h1>
      <p>View your registrations and access your tickets.</p>
    </header>

    <div v-if="tickets.length" class="tickets-grid">
      <AppCard v-for="ticket in tickets" :key="ticket.id" class="ticket-summary-card">
        <div class="card-top">
          <div class="top-left">
            <span class="category-badge">{{ ticket.event.cat }}</span>
            <span :class="['lifecycle-tag', ticket.event.done ? 'tag-concluded' : 'tag-upcoming']">
              {{ ticket.event.done ? 'Concluded' : 'Upcoming' }}
            </span>
          </div>
          <span class="booking-tag">#{{ ticket.bookingCode }}</span>
        </div>

        <h2 class="card-event-title">{{ ticket.event.title }}</h2>
        <div class="card-meta">
          <span class="meta-row"><strong>Date:</strong> {{ ticket.event.date }}</span>
          <span class="meta-row"><strong>Location:</strong> {{ ticket.event.loc }}</span>
          <span class="meta-row"><strong>Attendee:</strong> {{ ticket.fullName }}</span>
        </div>

        <div class="card-bottom">
          <button
            class="btn-view-ticket"
            @click="router.push(`/browse/your-events/${ticket.eventId}`)"
          >
            View Ticket Details →
          </button>
          <button
            v-if="!ticket.event.done"
            class="btn-subtle-cancel"
            @click="handleOpenCancel(ticket)"
          >
            Cancel
          </button>
        </div>
      </AppCard>
    </div>

    <div v-else class="empty-state">
      <div class="empty-illustration">🎫</div>
      <h2>No Events Registered Yet</h2>
      <p>Browse active events and register to start collecting tickets.</p>
      <AppButton variant="primary" @click="router.push('/browse/events')">Browse Events</AppButton>
    </div>

    <AppModal
      :is-open="isCancelModalOpen"
      title="Cancel Registration?"
      :message="`Cancel your registration for ${selectedRegistration?.event?.title || 'this event'}? Your seat will be returned to the event quota.`"
      confirm-text="Yes, Cancel Registration"
      cancel-text="Keep Registration"
      @confirm="handleConfirmCancel"
      @close="handleCloseCancel"
    />
  </div>
</template>

<style scoped>
.your-events-page {
  padding-bottom: var(--space-12);
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  font-size: 2.2rem;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.page-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-6);
}

.ticket-summary-card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-top,
.top-left,
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.card-top {
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.top-left {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.category-badge,
.lifecycle-tag,
.booking-tag {
  padding: var(--space-1) var(--space-2);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.category-badge {
  background: #ede9fe;
  color: #642849;
  text-transform: uppercase;
}

.lifecycle-tag {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.tag-upcoming {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag-concluded {
  background: #f1f5f9;
  color: #64748b;
}

.booking-tag {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-light);
}

.card-event-title {
  font-size: 1.3rem;
  color: var(--text-main);
  margin-bottom: var(--space-3);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-grow: 1;
}

.meta-row {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.meta-row strong {
  color: var(--text-main);
}

.card-bottom {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.btn-view-ticket,
.btn-subtle-cancel {
  background: none;
  border: none;
  cursor: pointer;
}

.btn-view-ticket {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-view-ticket:hover {
  text-decoration: underline;
}

.btn-subtle-cancel {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.btn-subtle-cancel:hover {
  color: #e63946;
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: var(--bg-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--space-4);
}

.empty-illustration {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
</style>
