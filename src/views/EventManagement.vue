<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import OrganizerEventCard from '@/components/event/OrganizerEventCard.vue'
import EventCreateForm from '@/components/event/EventCreateForm.vue'

const router = useRouter()
const { activeEvents, completedEvents, createEvent, completeEvent, deleteEvent } = useEvents()

const currentTab = ref('active')
const isModalOpen = ref(false)
const selectedEvent = ref(null)
const modalAction = ref('complete')

const handleOpenCompleteModal = (event) => {
  selectedEvent.value = event
  modalAction.value = 'complete'
  isModalOpen.value = true
}

const handleOpenDeleteModal = (event) => {
  selectedEvent.value = event
  modalAction.value = 'delete'
  isModalOpen.value = true
}

const handleConfirmModal = () => {
  if (!selectedEvent.value) return

  if (modalAction.value === 'complete') {
    completeEvent(selectedEvent.value.id)
  } else {
    deleteEvent(selectedEvent.value.id)
  }

  handleCancelModal()
}

const handleCancelModal = () => {
  isModalOpen.value = false
  selectedEvent.value = null
}

const handleCreateEvent = (eventData) => {
  createEvent(eventData)
  setTimeout(() => {
    currentTab.value = 'active'
  }, 1000)
}
</script>

<template>
  <div class="event-management-page">
    <header class="page-header">
      <div>
        <h1>Event Management Control</h1>
        <p>Manage event lifecycle, publish new events, and archive completed ones.</p>
      </div>
      <AppButton variant="primary" @click="currentTab = 'create'">Create New Event</AppButton>
    </header>

    <nav class="tabs-nav" aria-label="Event management sections">
      <button :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">
        Active Events ({{ activeEvents.length }})
      </button>
      <button :class="{ active: currentTab === 'create' }" @click="currentTab = 'create'">
        Create Event
      </button>
      <button :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">
        Completed Events ({{ completedEvents.length }})
      </button>
    </nav>

    <section v-if="currentTab === 'active'">
      <div v-if="activeEvents.length" class="event-grid">
        <OrganizerEventCard
          v-for="event in activeEvents"
          :key="event.id"
          :event="event"
          @view-detail="(id) => router.push(`/browse/events/${id}`)"
          @complete="handleOpenCompleteModal"
          @delete="handleOpenDeleteModal"
        />
      </div>
      <div v-else class="empty-state">
        <h2>No Active Events</h2>
        <p>All events have ended or none have been created yet. Please create a new event.</p>
        <AppButton variant="primary" @click="currentTab = 'create'">Create Event Now</AppButton>
      </div>
    </section>

    <section v-if="currentTab === 'create'">
      <EventCreateForm @submit="handleCreateEvent" @cancel="currentTab = 'active'" />
    </section>

    <section v-if="currentTab === 'completed'">
      <div v-if="completedEvents.length" class="event-grid">
        <OrganizerEventCard
          v-for="event in completedEvents"
          :key="event.id"
          :event="event"
          :is-completed="true"
          @delete="handleOpenDeleteModal"
        />
      </div>
      <div v-else class="empty-state">
        <h2>No Completed Events</h2>
        <p>Events marked as completed will be archived here.</p>
      </div>
    </section>

    <AppModal
      :is-open="isModalOpen"
      :title="modalAction === 'complete' ? 'Mark Event as Completed?' : 'Delete Event Permanently?'"
      :message="
        modalAction === 'complete'
          ? `Complete ${selectedEvent?.title}? This event will be archived.`
          : `Are you sure you want to delete ${selectedEvent?.title}? This action cannot be undone.`
      "
      :confirm-text="modalAction === 'complete' ? 'Yes, Complete Event' : 'Yes, Delete Permanently'"
      @confirm="handleConfirmModal"
      @close="handleCancelModal"
    />
  </div>
</template>

<style scoped>
.event-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-main);
  margin-bottom: var(--space-1);
}

.page-header p {
  color: var(--text-muted);
}

.tabs-nav {
  display: flex;
  gap: var(--space-3);
  border-bottom: 2px solid var(--border-color);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-2);
  overflow-x: auto;
}

.tabs-nav button {
  background: transparent;
  border: 0;
  padding: var(--space-3) var(--space-6);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.tabs-nav button:hover,
.tabs-nav button.active {
  color: var(--primary);
}

.tabs-nav button.active {
  box-shadow: inset 0 -3px var(--primary);
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  background: var(--bg-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--space-4);
  margin-bottom: var(--space-12);
}

.empty-state h2 {
  font-size: 1.4rem;
  margin-bottom: var(--space-2);
  color: var(--text-main);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

@media (max-width: 768px) {
  .page-header {
    align-items: flex-start;
  }
}
</style>
