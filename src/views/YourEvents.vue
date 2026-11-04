<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const router = useRouter()
const { userRegistrations, getEventById, cancelRegistration } = useEvents()
const selectedRegistration = ref(null)
const isCancelModalOpen = ref(false)
const isRegistrationsLoading = useEvents().isEventsLoading
const registrationsError = useEvents().eventsError

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

// Load registrations from API on component mount
;(async () => {
  await useEvents().getMyRegistrations()
})()
</script>

<template>
  <div class="your-events-page">
    <header class="page-header">
      <h1>Your Events</h1>
      <p>View your registrations and access your tickets.</p>
    </header>

    <!-- Loading state -->
    <div v-if="isRegistrationsLoading" class="loading-state">
      <LoadingSpinner />
      <p class="loading-text">Memuat pendaftaran...</p>
    </div>

    <!-- Error banner -->
    <ErrorBanner
      v-if="registrationsError"
      :is-open="true"
      :errorMessage="registrationsError"
      @retry="loadRegistrationsFromApi"
    />

    <div v-else>
      <div v-if="tickets.length" class="tickets-grid">
        <AppCard v-for="ticket in tickets" :key="ticket.id" class="ticket-summary-card">
          <div class="card-top">
            <div class="top-left">
              <span class="category-badge">{{ ticket.event.cat }}</span>
              <span
                :class="['lifecycle-tag', ticket.event.done ? 'tag-concluded' : 'tag-upcoming']"
              >
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
        <AppButton variant="primary" @click="router.push('/browse/events')"
          >Browse Events</AppButton
        >
      </div>
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-muted);
}

.loading-text {
  margin-top: var(--space-4);
  font-size: 1rem;
}
</style>
