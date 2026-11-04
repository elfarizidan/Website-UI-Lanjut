<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'

const route = useRoute()
const router = useRouter()
const { userRegistrations, getEventById, cancelRegistration } = useEvents()

const eventId = computed(() => Number(route.params.id))
const activeTicket = computed(() =>
  userRegistrations.value.find((registration) => registration.eventId === eventId.value),
)
const event = computed(() => getEventById(eventId.value))
const isCancelModalOpen = ref(false)

const handleConfirmCancel = () => {
  cancelRegistration(eventId.value)
  isCancelModalOpen.value = false
  router.push('/browse/your-events')
}
</script>

<template>
  <div v-if="activeTicket && event" class="ticket-receipt-page">
    <AppButton variant="outline" @click="router.push('/browse/your-events')">
      ← Back to Your Events
    </AppButton>

    <div class="ticket-receipt-card">
      <header class="receipt-header">
        <div class="header-status">
          <span :class="['status-badge', event.done ? 'badge-concluded' : 'badge-confirmed']">
            {{ event.done ? 'Event Concluded' : 'Confirmed Pass' }}
          </span>
          <span class="ref-code">#{{ activeTicket.bookingCode }}</span>
        </div>
        <p class="receipt-meta-date">
          Registered on
          {{
            new Date(activeTicket.registeredAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          }}
        </p>
      </header>

      <section class="receipt-section">
        <h2 class="event-title">{{ event.title }}</h2>
        <div class="receipt-grid">
          <div class="grid-item">
            <span class="item-label">Category</span>
            <span class="item-value">{{ event.cat }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Date & Time</span>
            <span class="item-value">{{ event.date }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Location / Venue</span>
            <span class="item-value">{{ event.loc }}</span>
          </div>
        </div>
      </section>

      <section class="receipt-section">
        <h3 class="section-heading">Attendee Information</h3>
        <div class="receipt-grid">
          <div class="grid-item">
            <span class="item-label">Full Name</span>
            <span class="item-value">{{ activeTicket.fullName }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Email Address</span>
            <span class="item-value">{{ activeTicket.email }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Phone Number</span>
            <span class="item-value">{{ activeTicket.phone }}</span>
          </div>
          <div class="grid-item">
            <span class="item-label">Date of Birth</span>
            <span class="item-value">{{ activeTicket.dob }}</span>
          </div>
        </div>
      </section>

      <section class="receipt-section">
        <h3 class="section-heading">Reason for Attending</h3>
        <p class="reason-text">{{ activeTicket.reason }}</p>
      </section>

      <footer class="receipt-footer">
        <AppButton variant="primary" @click="router.push('/browse/your-events')">
          Back to Your Events
        </AppButton>
        <button v-if="!event.done" class="btn-cancel-reg" @click="isCancelModalOpen = true">
          Cancel Registration
        </button>
        <span v-else class="concluded-notice"
          >This event has concluded. Your ticket is archived.</span
        >
      </footer>
    </div>
  </div>

  <div v-else class="notice-card">
    <span class="notice-badge">NOT FOUND</span>
    <h2>Ticket Not Found</h2>
    <p>You do not have an active registration for this event, or it has been cancelled.</p>
    <AppButton variant="primary" @click="router.push('/browse/your-events')">
      View Your Events List
    </AppButton>
  </div>

  <AppModal
    :is-open="isCancelModalOpen"
    title="Cancel Registration?"
    message="Your seat will be returned to the event quota and your ticket will be removed."
    confirm-text="Yes, Cancel Registration"
    cancel-text="Keep Registration"
    @confirm="handleConfirmCancel"
    @close="isCancelModalOpen = false"
  />
</template>

<style scoped>
.ticket-receipt-page {
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: var(--space-12);
}

.ticket-receipt-card {
  margin-top: var(--space-6);
  padding: var(--space-8);
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--space-4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.receipt-header {
  padding-bottom: var(--space-6);
  border-bottom: 2px dashed var(--border-color);
  margin-bottom: var(--space-6);
}

.header-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.status-badge,
.notice-badge {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: 4px;
}

.badge-confirmed {
  background: #dcfce7;
  color: #15803d;
}

.badge-concluded {
  background: #f1f5f9;
  color: #64748b;
}

.ref-code {
  font-family: monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
}

.receipt-meta-date {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.receipt-section {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.section-heading {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

.event-title {
  color: var(--text-main);
  margin-bottom: var(--space-4);
}

.receipt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.item-value {
  color: var(--text-main);
  font-weight: 600;
}

.reason-text {
  background: var(--bg-light);
  border-radius: 8px;
  padding: var(--space-4);
  color: var(--text-main);
  line-height: 1.6;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding-top: var(--space-4);
}

.btn-cancel-reg {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}

.btn-cancel-reg:hover {
  color: #e63946;
}

.concluded-notice {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

.notice-card {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  background: white;
  border-radius: var(--space-4);
  border: 1px solid var(--border-color);
  max-width: 500px;
  margin: var(--space-8) auto;
}

.notice-badge {
  display: inline-block;
  background: var(--bg-light);
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

.notice-card h2 {
  font-size: 1.5rem;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.notice-card p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
</style>
