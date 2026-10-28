<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'
import RegistrationSummary from '@/components/event/RegistrationSummary.vue'
import RegistrationForm from '@/components/event/RegistrationForm.vue'
import RegistrationReceipt from '@/components/event/RegistrationReceipt.vue'

const router = useRouter()
const route = useRoute()
const { getEventById, registerAttendee } = useEvents()

const event = computed(() => getEventById(route.params.id))

const isRegistered = computed(() => {
  return event.value ? getRegistrationByEventId(event.value.id) != null : false
})

const isSuccessModalOpen = ref(false)
const confirmedData = ref(null)

const handleRegistrationSuccess = (record) => {
  confirmedData.value = record
  isSuccessModalOpen.value = true
}

const handleBackToDetail = () => {
  router.push(event.value?.id ? `/browse/events/${event.value.id}` : '/browse/events')
}

const handleGoToCatalog = () => {
  isSuccessModalOpen.value = false
  router.push('/browse/events')
}

const handleGoToYourEvents = () => {
  isSuccessModalOpen.value = false
  router.push('/your-events')
}
</script>

<template>
  <div v-if="event" class="event-registration-page">
    <div class="event-status-bar">
      <template v-if="event.done">
        <span class="status-badge concluded">Registration Closed</span>
      </template>
      <template v-else-if="isRegistered">
        <span class="status-badge registered">Already Registered</span>
      </template>
      <template v-else>
        <span class="status-badge open">Open Registration</span>
      </template>
    </div>

    <div class="two-column-layout">
      <RegistrationSummary :event="event" @back="handleBackToDetail" />

      <RegistrationForm
        :event="event"
        @success="handleRegistrationSuccess"
        @cancel="handleBackToDetail"
      />
    </div>

    <AppModal
      :is-open="isSuccessModalOpen"
      title="Registration Confirmed"
      badge-text="Registration Confirmed"
      badge-variant="primary"
      :show-cancel="false"
      @close="handleSuccessModalClose"
      :ticket="confirmedData"
      :event="event"
    >
      <template #footer>
        <AppButton variant="primary" @click="handleGoToCatalog">Back to Event Catalog</AppButton>
        <AppButton variant="primary" @click="handleGoToYourEvents">Go to Your Events</AppButton>
      </template>
    </AppModal>
  </div>

  <div v-else class="not-found-card">
    <div class="not-found-icon">🔍</div>
    <h2>Event Not Found</h2>
    <p>The event you are trying to register for is not available or has been deleted.</p>
    <AppButton variant="primary" @click="router.push('/browse/events')">Back to Events</AppButton>
  </div>
</template>

<style scoped>
.event-registration-page {
  min-height: 100%;
  padding: var(--space-8);
}

.event-status-bar {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-right: var(--space-4);
}

.status-badge.concluded {
  background: rgba(102, 112, 133, 0.1);
  color: var(--text-muted);
}

.status-badge.registered {
  background: rgba(102, 68, 255, 0.1);
  color: var(--primary);
}

.status-badge.open {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
  margin-top: var(--space-8);
}
</style>
