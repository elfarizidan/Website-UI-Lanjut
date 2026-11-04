<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import SearchBar from '@/components/event/SearchBar.vue'
import CategoryFilter from '@/components/event/CategoryFilter.vue'
import EventCard from '@/components/event/EventCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'

const router = useRouter()
const { activeEvents, isUserRegistered, isEventsLoading, eventsError } = useEvents()

const searchQuery = ref('')
const selectedCategory = ref('All')

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return activeEvents.value.filter((event) => {
    const matchSearch =
      query === '' ||
      event.title.toLowerCase().includes(query) ||
      event.loc.toLowerCase().includes(query) ||
      event.desc.toLowerCase().includes(query)
    const matchCat = selectedCategory.value === 'All' || event.cat === selectedCategory.value

    return matchSearch && matchCat
  })
})

onMounted(() => {
  // Events already loaded from useEvents init
})
</script>

<template>
  <div class="event-list-page">
    <div class="header-section">
      <h2 class="section-title">Upcoming Events</h2>
      <p class="section-desc">
        Discover workshops, seminars, tech meetups, and competitions near you.
      </p>
    </div>

    <SearchBar v-model="searchQuery" />
    <CategoryFilter
      :categories="['All', 'Workshop', 'Meetup', 'Competition', 'Seminar', 'Conference']"
      v-model="selectedCategory"
    />

    <!-- LAYOUT SYSTEM: ADAPTIVE GRID -->
    <div v-if="isEventsLoading" class="loading-state">
      <LoadingSpinner />
      <p class="loading-text">Memuat acara...</p>
    </div>

    <template v-else>
      <div v-if="filteredEvents.length > 0" class="event-grid">
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
          :is-registered="isUserRegistered(event.id)"
          @view-detail="$router.push('/browse/events/' + event.id)"
        />
      </div>

      <div v-else class="empty-state-card">
        <div class="empty-illustration">📅</div>
        <h3 class="empty-title">No Events Available Yet</h3>
        <p class="empty-description">
          Be the first to publish your own event from the organizer dashboard
        </p>
        <AppButton variant="primary" @click="$router.push('/dashboard/events')"
          >Create Your First Event</AppButton
        >
      </div>
    </template>

    <!-- ERROR BANNER -->
    <ErrorBanner
      v-if="eventsError"
      :is-open="true"
      :errorMessage="eventsError"
      @retry="loadEventsFromApi"
    />
  </div>
</template>

<style scoped>
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
