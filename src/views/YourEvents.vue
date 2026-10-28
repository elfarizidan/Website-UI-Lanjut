<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const { userRegistrations, activeEvents, completeEvent, deleteEvent } = useEvents()

const handleOpenCancelModal = (eventId) => {
  isEventDone.value = false
  openCancelModal.value = true
}

const isEventDone = (id) => {
  return activeEvents.value.some((e) => (e.id === Number(id) ? e.done : false))
}

const openCancelModal = ref(false)

const handleCancelRegistration = (eventId) => {
  userRegistrations.value = userRegistrations.value.filter((r) => r.eventId !== eventId)
  deleteEvent(eventId)
  isEventDone.value = false
  openCancelModal.value = false
}
</script>

<template>
  <div class="your-events-page">
    <div v-if="userRegistrations.length > 0" class="events-list">
      <div v-for="reg in userRegistrations" :key="reg.id" class="event-card">
        <div class="card-header">
          <span class="category-badge">{{ reg.cat }}</span>
          <span
            :class="[
              'status-badge',
              isEventDone(reg.eventId) ? 'status-completed' : 'status-active',
            ]"
          >
            {{ isEventDone(reg.eventId) ? 'Completed' : 'Active' }}
          </span>
        </div>

        <h3 class="event-title">{{ reg.title }}</h3>
        <p class="event-meta">{{ reg.date }} &bull; {{ reg.loc }}</p>
        <p class="event-desc">{{ reg.desc }}</p>

        <div class="card-actions">
          <template v-if="!isEventDone(reg.eventId)">
            <button
              class="btn-action btn-detail"
              @click="router.push(`/your-events/${reg.eventId}`)"
            >
              View Ticket Details
            </button>
          </template>
          <template v-else>
            <button class="btn-action btn-delete" @click="handleCancelRegistration(reg.eventId)">
              Cancel
            </button>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-illustration">🎫</div>
      <h3 class="empty-title">No Events Registered Yet</h3>
      <p class="empty-description">Browse active events and register to start collecting tickets</p>
      <AppButton variant="primary" @click="router.push('/browse/events')">
        Browse Events
      </AppButton>
    </div>
  </div>

  <!-- Cancel Confirmation Modal -->
  <AppModal
    :is-open="openCancelModal"
    title="Cancel Registration"
    badge-text="Cancel Registration"
    badge-variant="danger"
    :show-cancel="true"
    @close="openCancelModal.value = false"
    @confirm="handleCancelRegistration(openCancelModal.value ? reg.eventId : null)"
  >
    <template #footer>
      <AppButton variant="secondary" @click="openCancelModal.value = false">Keep Editing</AppButton>
      <AppButton variant="danger" @click="openCancelModal.value = false">Yes, Discard</AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.your-events-page {
  padding: var(--space-8);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.event-card {
  padding: var(--space-8);
  border: 1px solid var(--border-color);
  border-radius: var(--space-4);
  background: white;
  box-shadow: 0 4px 20px rgba(2, 0, 2, 0.03);
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.category-badge {
  background: rgba(102, 68, 255, 0.1);
  color: var(--primary);
  padding: var(--space-1) var(--space-2);
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-title {
  font-size: 1.3rem;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.event-meta {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

.event-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-action {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-action.btn-detail {
  color: var(--primary);
  border-color: var(--primary);
}

.btn-action.btn-detail:hover {
  background: rgba(102, 68, 255, 0.05);
}

.btn-action.btn-delete {
  color: #e63946;
  border-color: rgba(230, 57, 70, 0.3);
}

.btn-action.btn-delete:hover {
  background: #e63946;
  color: white;
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  color: var(--text-muted);
}

.empty-illustration {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.empty-description {
  margin-bottom: var(--space-6);
}
</style>
