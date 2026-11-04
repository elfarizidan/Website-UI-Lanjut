<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import RegistrationSummary from '@/components/event/RegistrationSummary.vue'
import RegistrationForm from '@/components/event/RegistrationForm.vue'
import RegistrationReceipt from '@/components/event/RegistrationReceipt.vue'

const router = useRouter()
const route = useRoute()
const { getEventById, getRegistrationByEventId } = useEvents()

const event = computed(() => getEventById(route.params.id))
const isRegistered = computed(() =>
  event.value ? Boolean(getRegistrationByEventId(event.value.id)) : false,
)
const isSuccessModalOpen = ref(false)
const confirmedData = ref(null)

// Tambah state loading untuk registration
const isRegisterLoading = ref(false)

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
  router.push('/browse/your-events')
}

// Fungsi registrasi yang terintegrasi dengan API
const handleRegister = async (participantData) => {
  isRegisterLoading.value = true

  try {
    const result = await useEvents().registerAttendee(event.value.id, participantData)

    if (result && result.event) {
      // Registration in progress - update UI locally
      // Will be updated again when API resolves
    }

    // Tunggu sebentar lalu cek status
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Cek ulang registrasi
    const isRegNow = event.value ? Boolean(getRegistrationByEventId(event.value.id)) : false

    if (isRegNow) {
      // Sukses - tampilkan modal konfirmasi
      const regRecord = getRegistrationByEventId(event.value.id)
      if (regRecord) {
        handleRegistrationSuccess(regRecord)
      }
    } else {
      // Gagal - tampilkan error
      alert('Registrasi gagal. Silakan coba lagi.')
    }
  } catch (err) {
    console.error('Registration error:', err)
    alert('Terjadi kesalahan saat registrasi. Silakan coba lagi.')
  } finally {
    isRegisterLoading.value = false
  }
}
</script>

<template>
  <div v-if="event" class="event-registration-page">
    <div class="event-status-bar">
      <span v-if="event.done" class="status-badge concluded">Registration Closed</span>
      <span v-else-if="isRegistered" class="status-badge registered">Already Registered</span>
      <span v-else-if="event.quota <= 0" class="status-badge concluded">Sold Out</span>
      <span v-else class="status-badge open">Open Registration</span>
    </div>

    <div class="two-column-layout">
      <RegistrationSummary :event="event" @back="handleBackToDetail" />

      <RegistrationForm
        v-if="!event.done && !isRegistered && event.quota > 0"
        :event="event"
        @success="handleRegistrationSuccess"
        @cancel="handleBackToDetail"
        @register="handleRegister"
      />
      <div v-else class="registration-notice">
        <h2>{{ isRegistered ? 'You are registered' : 'Registration unavailable' }}</h2>
        <p>
          {{
            isRegistered
              ? 'Your ticket is available in Your Events.'
              : 'This event is no longer accepting registrations.'
          }}
        </p>
        <AppButton
          v-if="isRegistered"
          variant="primary"
          @click="router.push(`/browse/your-events/${event.id}`)"
        >
          View Ticket
        </AppButton>
      </div>
    </div>

    <AppModal
      :is-open="isSuccessModalOpen"
      title="Registration Confirmed"
      badge-text="Registration Confirmed"
      :show-cancel="false"
      @close="isSuccessModalOpen = false"
    >
      <RegistrationReceipt :confirmed-data="confirmedData" :event="event" />
      <template #footer>
        <AppButton variant="outline" @click="handleGoToCatalog">Back to Event Catalog</AppButton>
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
  padding: var(--space-8);
}

.event-status-bar {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.two-column-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
  margin-top: var(--space-8);
}

.registration-notice {
  padding: var(--space-8);
  border: 1px solid var(--border-color);
  border-radius: var(--space-4);
  background: white;
}

.registration-notice h2 {
  margin-bottom: var(--space-2);
}

.registration-notice p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

/* Loading state untuk form register */
.form-register-loading .btn-primary {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
