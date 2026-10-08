<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/event/SearchBar.vue'
import CategoryFilter from '@/components/event/CategoryFilter.vue'
import EventCard from '@/components/event/EventCard.vue'

const router = useRouter()

const events = [
  {
    id: 1,
    title: 'Vue.js Mastery Workshop',
    date: 'Oct 12, 2026',
    loc: '📍 Tech Hub, Jakarta',
    cat: 'Workshop',
    desc: 'Learn advanced Vue 3 concepts, Composition API, and state management to build high-performance web applications interactively.',
  },
  {
    id: 2,
    title: 'National Tech Meetup',
    date: 'Oct 15, 2026',
    loc: '📍 Main Auditorium, City Center',
    cat: 'Meetup',
    desc: 'A gathering of hundreds of developers and tech enthusiasts to share the latest industry trends and expand professional networks.',
  },
  {
    id: 3,
    title: 'Startup Pitch Competition',
    date: 'Nov 02, 2026',
    loc: '📍 Innovation Center',
    cat: 'Competition',
    desc: 'Watch the best local startup founders pitch their innovative ideas live in front of a panel of renowned investors.',
  },
  {
    id: 4,
    title: 'UI/UX Design Sprint',
    date: 'Nov 10, 2026',
    loc: '📍 Creative Studio',
    cat: 'Workshop',
    desc: 'A hands-on session on designing user interfaces by implementing layout systems and visual hierarchy principles.',
  },
  {
    id: 5,
    title: 'Digital Marketing Seminar',
    date: 'Nov 20, 2026',
    loc: '📍 Grand Hotel Hall',
    cat: 'Seminar',
    desc: 'An in-depth seminar dissecting modern digital marketing strategies, from SEO optimization to user conversion tactics.',
  },
  {
    id: 6,
    title: 'Community Leaders Summit',
    date: 'Dec 05, 2026',
    loc: '📍 Gatherly HQ',
    cat: 'Conference',
    desc: 'An exclusive year-end conference for community leaders to formulate sustainable ecosystem development strategies.',
  },
]

const categories = ['All', 'Workshop', 'Meetup', 'Competition', 'Seminar', 'Conference']

const searchQuery = ref('')
const selectedCategory = ref('All')

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return events.filter((event) => {
    const matchSearch =
      query === '' ||
      event.title.toLowerCase().includes(query) ||
      event.loc.toLowerCase().includes(query) ||
      event.desc.toLowerCase().includes(query)
    const matchCat = selectedCategory.value === 'All' || event.cat === selectedCategory.value

    return matchSearch && matchCat
  })
})

const handleViewDetail = (id) => {
  router.push(`/browse/events/${id}`)
}
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
    <CategoryFilter :categories="categories" v-model="selectedCategory" />

    <!-- LAYOUT SYSTEM: ADAPTIVE GRID -->
    <div class="event-grid" v-if="filteredEvents.length">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        @view-detail="handleViewDetail"
      />
    </div>

    <!-- STATE-DRIVEN UI: EMPTY STATE -->
    <div class="empty-state" v-else>
      <p class="empty-title">No events found</p>
      <p class="empty-desc">Try a different keyword or pick another category.</p>
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

.empty-state {
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
}
</style>
