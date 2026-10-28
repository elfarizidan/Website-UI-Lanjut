<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import SearchBar from '@/components/event/SearchBar.vue'
import CategoryFilter from '@/components/event/CategoryFilter.vue'
import EventCard from '@/components/event/EventCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const { activeEvents } = useEvents()

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
    <div class="event-grid" v-if="filteredEvents.length > 0">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        :is-registered="isUserRegistered(event.id)"
        @view-detail="$router.push('/browse/events/' + event.id)"
      />
    </div>

    <!-- STATE-DRIVEN UI: FRIENDLY EMPTY STATE -->
    <div class="empty-state-card" v-else>
      <div class="empty-illustration">📅</div>
      <h3 class="empty-title">No Events Available Yet</h3>
      <p class="empty-description">
        Be the first to publish your own event from the organizer dashboard
      </p>
      <AppButton variant="primary" @click="$router.push('/dashboard/events')"
        >Create Your First Event</AppButton
      >
    </div>
  </div>
</template>

<style scoped>
.header-section {
  margin-bottom: var(--space-8);
}
.section-title {
  font-size: 2.2rem;
  margin-bottom: var(--space-2);
}
.section-desc {
  color: var(--text-muted);
  font-size: 1.1rem;
}

/* ADAPTIVE GRID */
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
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
</style>
