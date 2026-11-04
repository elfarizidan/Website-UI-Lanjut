import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

const STORAGE_KEY = 'gatherly_events'
const api = useApi()

// Handle both old format (plain array) and new format (object with events + registrations)
let parsedData
try {
  parsedData = localStorage.getItem(STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_KEY))
    : []
} catch (e) {
  parsedData = []
}

// If old format (array), convert to new format (object)
let eventsArray
let registrationsArray

if (Array.isArray(parsedData)) {
  // Old Modul 4 format: just an array of events
  eventsArray = parsedData
  registrationsArray = []
} else if (parsedData && parsedData.events) {
  // New format: { events, registrations }
  eventsArray = parsedData.events
  registrationsArray = parsedData.registrations || []
} else {
  // Fallback to empty
  eventsArray = []
  registrationsArray = []
}

const events = ref(eventsArray)
const userRegistrations = ref(registrationsArray)

// --- API INTEGRATION ---
// Try to fetch from API first, fallback to localStorage if API fails
// This maintains backward compatibility while adding API support

const loadEventsFromApi = async () => {
  try {
    const data = await api.getEvents(false) // false = no mock, use real API or localStorage fallback
    if (data && Array.isArray(data)) {
      events.value = data
      // Sync to localStorage too for backward compat
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: data, registrations: userRegistrations.value }))
    }
  } catch (err) {
    console.error('Failed to load events from API, falling back to localStorage:', err)
    // Keep using localStorage if API fails
  }
}

const loadRegistrationsFromApi = async () => {
  try {
    const data = await api.getMyRegistrations()
    if (data && Array.isArray(data)) {
      userRegistrations.value = data
    }
  } catch (err) {
    console.error('Failed to load registrations from API, falling back to localStorage:', err)
  }
}

// Initial load - try API first
;(async () => {
  await loadEventsFromApi()
  await loadRegistrationsFromApi()
})()

const totalEvents = computed(() => events.value.length)
const activeEvents = computed(() => events.value.filter((e) => !e.done))
const completedEvents = computed(() => events.value.filter((e) => e.done))
const userRegistrationsCount = computed(() => userRegistrations.value.length)

watch(
  events,
  (newEvents) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: newEvents, registrations: userRegistrations.value }),
    )
  },
  { deep: true },
)

watch(
  userRegistrations,
  (newRegs) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: events.value, registrations: newRegs }),
    )
  },
  { deep: true },
)

// --- API Functions ---

const createEvent = (eventData) => {
  // Simpan ke dulu di localStorage, lalu kirim ke API
  const newEvent = {
    id: Date.now(),
    title: eventData.title,
    date: eventData.date,
    loc: eventData.loc.startsWith('🍍 ') ? eventData.loc : `📍 ${eventData.loc}`,
    cat: eventData.cat,
    quota: Number(eventData.quota) || 100,
    price: eventData.price || 'Free',
    desc: eventData.desc,
    done: false,
  }

  events.value.unshift(newEvent)
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
  )

  // Coba kirim ke API (non-blocking - jika gagal, data tetap ada di localStorage)
  api
    .registerAttendee(newEvent.id, {
      fullName: eventData.organizerName || 'Organizer',
      email: eventData.organizerEmail || '',
      phone: eventData.organizerPhone || '',
      dob: eventData.organizerDob || '',
      reason: 'Event created',
    })
    .catch((err) => {
      console.log('API register failed (event created locally):', err)
    })

  return newEvent
}

const registerAttendee = (eventId, participantData) => {
  const event = events.value.find((e) => e.id === Number(eventId))
  if (!event || event.quota <= 0) return null

  // Kurangi quota lokal dulu untuk UI yang cepat
  event.quota -= 1

  // Kirim ke API
  api
    .registerAttendee(eventId, {
      ...participantData,
      eventTitle: event.title,
    })
    .then((response) => {
      // Sukses dari API - tambah registrasi ke local state
      const bookingCode = response.bookingCode || 'GTH-' + Date.now().toString().slice(-4)
      const regRecord = {
        id: Date.now(),
        eventId: Number(eventId),
        bookingCode,
        registeredAt: new Date().toISOString(),
        ...participantData,
      }

      userRegistrations.value.unshift(regRecord)

      // Update localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
      )

      // Panggil callback jika ada (untuk views yang butuh response)
      if (window.onRegistrationSuccess) {
        window.onRegistrationSuccess(response)
      }
    })
    .catch((err) => {
      // API gagal - kembali kan quota lokal
      event.quota += 1

      console.error('Registration API failed, rolled back quota:', err)

      // Coba simpan ke localStorage saja sebagai fallback
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
      )
    })

  return { event, pending: true } // Return pending state
}

const getEventById = (id) => {
  // Coba ambil dari API dulu
  const apiEvent = api.getEventById(id, true) // true = return mock jika gagal
  const localEvent = events.value.find((e) => e.id === Number(id))

  // Return API event jika ada, else local event
  return apiEvent ? apiEvent : localEvent
}

const getRegistrationByEventId = (eventId) => {
  // Coba ambil dari API
  const registration = userRegistrations.value.find(
    (r) => r.eventId === Number(eventId),
  )

  // Jika tidak ada di state lokal, coba dari localStorage
  if (!registration) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return data.registrations?.find((r) => r.eventId === Number(eventId))
    }
  }

  return registration
}

const isUserRegistered = (eventId) => {
  return userRegistrations.value.some((r) => r.eventId === Number(eventId))
}

const cancelRegistration = (eventId) => {
  const id = Number(eventId)
  const registrationIndex = userRegistrations.value.findIndex(
    (r) => r.eventId === id,
  )
  if (registrationIndex === -1) return false

  const event = events.value.find((item) => item.id === id)
  if (event) event.quota = Number(event.quota || 0) + 1

  // Hapus dari state lokal
  userRegistrations.value.splice(registrationIndex, 1)

  // Kirim ke API
  api
    .cancelRegistration(id)
    .then(() => {
      // Success - already removed from state
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
      )
    })
    .catch((err) => {
      console.error('Cancel registration API failed:', err)
      // Rollback - tambahkan registrasi kembali kalau API gagal
      userRegistrations.value.unshift({
        id,
        eventId: id,
        bookingCode: '',
        registeredAt: new Date().toISOString(),
        ...(userRegistrations.value[registrationIndex] || {}),
      })
      if (event) event.quota = Number(event.quota || 0) - 1
    })

  return true
}

const deleteEvent = (id) => {
  const idx = events.value.findIndex((e) => e.id === Number(id))
  if (idx !== -1) {
    events.value.splice(idx, 1)
    userRegistrations.value = userRegistrations.value.filter(
      (r) => r.eventId !== Number(id),
    )
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
    )

    // Hapus dari API
    api
      .cancelRegistration(Number(id))
      .catch((err) => {
        console.error('Delete event from API failed:', err)
        // Data tetap dihapus dari local state meskipun API gagal
      })
  }
}

const clearAllEvents = () => {
  events.value = []
  userRegistrations.value = []
  localStorage.removeItem(STORAGE_KEY)
}

export function useEvents() {
  const totalEvents = computed(() => events.value.length)
  const activeEvents = computed(() => events.value.filter((e) => !e.done))
  const completedEvents = computed(() => events.value.filter((e) => e.done))
  const userRegistrationsCount = computed(() => userRegistrations.value.length)
  const isEventsLoading = api.isLoading
  const eventsError = api.error

  return {
    events,
    totalEvents,
    activeEvents,
    completedEvents,
    userRegistrations,
    userRegistrationsCount,
    isEventsLoading,
    eventsError,
    createEvent,
    registerAttendee,
    getEventById,
    getRegistrationByEventId,
    isUserRegistered,
    cancelRegistration,
    deleteEvent,
    clearAllEvents,
    // API helper functions
    getEvents: api.getEvents,
    getEventById: api.getEventById,
    registerAttendee: api.registerAttendee,
    getMyRegistrations: api.getMyRegistrations,
    cancelRegistration: api.cancelRegistration,
    request: api.request,
  }
}