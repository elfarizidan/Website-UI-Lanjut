<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EventCard from '@/components/event/EventCard.vue'

const router = useRouter()
const { activeEvents, completedEvents, createEvent, completeEvent, deleteEvent } = useEvents()

const currentTab = ref('active')
const isModalOpen = ref(false)
const selectedEvent = ref(null)
const modalAction = ref('')

const form = ref({
  title: '',
  cat: 'Workshop',
  date: '',
  loc: '',
  quota: 100,
  price: 'Free',
  desc: '',
})

const errorMessage = ref('')
const successMessage = ref('')

const formatEventDate = (dateStr) => {
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  )
}

const handleSubmitEvent = () => {
  if (
    !form.value.title.trim() ||
    !form.value.date ||
    !form.value.loc.trim() ||
    !form.value.desc.trim()
  ) {
    errorMessage.value = 'Please fill in all required fields before publishing the event!'
    return
  }

  errorMessage.value = ''
  createEvent({
    title: form.value.title.trim(),
    cat: form.value.cat,
    date: formatEventDate(form.value.date),
    loc: form.value.loc.trim(),
    quota: Number(form.value.quota),
    price: form.value.price,
    desc: form.value.desc.trim(),
  })

  successMessage.value = 'Event published successfully and is now live!'
  Object.assign(form.value, {
    title: '',
    cat: 'Workshop',
    date: '',
    loc: '',
    quota: 100,
    price: 'Free',
    desc: '',
  })

  setTimeout(() => {
    currentTab.value = 'active'
  }, 1500)
}

const handleOpenCompleteModal = (item) => {
  selectedEvent.value = item
  modalAction.value = 'complete'
  isModalOpen.value = true
}

const handleOpenDeleteModal = (item) => {
  selectedEvent.value = item
  modalAction.value = 'delete'
  isModalOpen.value = true
}

const handleConfirmModal = () => {
  if (!selectedEvent.value) return

  if (modalAction.value === 'complete') {
    completeEvent(selectedEvent.value.id)
  } else if (modalAction.value === 'delete') {
    deleteEvent(selectedEvent.value.id)
  }

  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  selectedEvent.value = null
  modalAction.value = ''
}
</script>

<template>
  <div class="event-management-page">
    <div class="tabs-nav">
      <button :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">
        Active Events
      </button>
      <button :class="{ active: currentTab === 'create' }" @click="currentTab = 'create'">
        Create Event
      </button>
      <button :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">
        Completed Events
      </button>
    </div>

    <section v-if="currentTab === 'active'">
      <div class="events-list-header">
        <h2>Active Events ({{ activeEvents.length }})</h2>
      </div>
      <div class="event-grid" v-if="activeEvents.length > 0">
        <EventCard
          v-for="event in activeEvents"
          :key="event.id"
          :event="event"
          @view-detail="handleOpenCompleteModal"
        >
          <template #actions>
            <AppButton variant="secondary" @click="handleOpenCompleteModal(event)"
              >Complete</AppButton
            >
            <AppButton variant="outline" @click="handleOpenDeleteModal(event)">Delete</AppButton>
          </template>
        </EventCard>
      </div>
      <div class="empty-state-card" v-else>
        <p class="empty-title">No Active Events</p>
        <p class="empty-desc">Create your first event to get started.</p>
        <AppButton variant="primary" @click="currentTab = 'create'">Create Event</AppButton>
      </div>
    </section>

    <section v-if="currentTab === 'create'">
      <h2>Create New Event Form</h2>
      <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
      <form @submit.prevent="handleSubmitEvent" class="event-form">
        <div class="form-group">
          <label for="title">Event Title *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Enter event title"
            required
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cat">Event Category *</label>
            <select id="cat" v-model="form.cat" required>
              <option value="Workshop">Workshop</option>
              <option value="Meetup">Meetup</option>
              <option value="Competition">Competition</option>
              <option value="Seminar">Seminar</option>
              <option value="Conference">Conference</option>
            </select>
          </div>
          <div class="form-group">
            <label for="date">Date & Time *</label>
            <input id="date" v-model="form.date" type="datetime-local" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="loc">Event Location *</label>
            <input id="loc" v-model="form.loc" type="text" placeholder="Enter location" required />
          </div>
          <div class="form-group">
            <label for="quota">Attendee Quota</label>
            <input id="quota" v-model.number="form.quota" type="number" min="1" placeholder="100" />
          </div>
        </div>
        <div class="form-group">
          <label for="price">Ticket Price</label>
          <input id="price" v-model="form.price" type="text" placeholder="Free" />
        </div>
        <div class="form-group">
          <label for="desc">Event Description *</label>
          <textarea
            id="desc"
            v-model="form.desc"
            rows="5"
            placeholder="Describe your event..."
            required
          ></textarea>
        </div>
        <AppButton type="submit" variant="primary">Publish Event</AppButton>
      </form>
    </section>

    <section v-if="currentTab === 'completed'">
      <div class="events-list-header">
        <h2>Completed Events ({{ completedEvents.length }})</h2>
      </div>
      <div class="event-grid" v-if="completedEvents.length > 0">
        <EventCard v-for="event in completedEvents" :key="event.id" :event="event" />
      </div>
      <div class="empty-state-card" v-else>
        <p class="empty-title">No Completed Events</p>
        <p class="empty-desc">Completed events will appear here.</p>
      </div>
    </section>

    <AppModal
      :is-open="isModalOpen"
      :title="modalAction === 'complete' ? 'Mark Event as Completed?' : 'Delete Event Permanently?'"
      :message="
        modalAction === 'complete'
          ? 'This event will be moved to archives. This action cannot be undone.'
          : 'Are you sure you want to permanently delete this event? This action cannot be undone and will permanently remove this event from all records.'
      "
      :confirm-text="modalAction === 'complete' ? 'Yes, Complete Event' : 'Yes, Delete Permanently'"
      @confirm="handleConfirmModal"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.tabs-nav {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-2);
}

.tabs-nav button {
  padding: var(--space-3) var(--space-6);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tabs-nav button:hover {
  color: var(--text-main);
}

.tabs-nav button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.events-list-header {
  margin-bottom: var(--space-6);
}

.events-list-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.empty-state-card {
  background: var(--bg-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--space-4);
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: var(--space-2);
}

.empty-desc {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-group label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-main);
  background: white;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 68, 255, 0.15);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.error-message {
  background: rgba(230, 57, 70, 0.1);
  color: #e63946;
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid rgba(230, 57, 70, 0.2);
}

.success-message {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid rgba(46, 204, 113, 0.2);
}
</style>
