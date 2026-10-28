import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'gatherly_events'
const savedData = localStorage.getItem(STORAGE_KEY)

// Handle both old format (plain array) and new format (object with events + registrations)
let parsedData
try {
  parsedData = savedData ? JSON.parse(savedData) : []
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

export function useEvents() {
  const totalEvents = computed(() => events.value.length)
  const activeEvents = computed(() => events.value.filter((e) => !e.done))
  const completedEvents = computed(() => events.value.filter((e) => e.done))
  const userRegistrationsCount = computed(() => userRegistrations.value.length)

  const createEvent = (eventData) => {
    events.value.unshift({
      id: Date.now(),
      title: eventData.title,
      date: eventData.date,
      loc: eventData.loc.startsWith('📍 ') ? eventData.loc : `📍 ${eventData.loc}`,
      cat: eventData.cat,
      quota: Number(eventData.quota) || 100,
      price: eventData.price || 'Free',
      desc: eventData.desc,
      done: false,
    })
  }

  const registerAttendee = (eventId, participantData) => {
    const event = events.value.find((e) => e.id === Number(eventId))
    if (!event || event.quota <= 0) return null

    event.quota -= 1

    const bookingCode = 'GTH-' + Date.now().toString().slice(-4)
    const regRecord = {
      id: Date.now(),
      eventId: Number(eventId),
      bookingCode,
      registeredAt: new Date().toISOString(),
      ...participantData,
    }

    userRegistrations.value.unshift(regRecord)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
    )

    return regRecord
  }

  const getEventById = (id) => {
    return events.value.find((e) => e.id === Number(id))
  }

  const getRegistrationByEventId = (eventId) => {
    return userRegistrations.value.find((r) => r.eventId === Number(eventId))
  }

  const isUserRegistered = (eventId) => {
    return userRegistrations.value.some((r) => r.eventId === Number(eventId))
  }

  const cancelRegistration = (eventId) => {
    const id = Number(eventId)
    const registrationIndex = userRegistrations.value.findIndex((r) => r.eventId === id)
    if (registrationIndex === -1) return false

    const event = events.value.find((item) => item.id === id)
    if (event) event.quota = Number(event.quota || 0) + 1
    userRegistrations.value.splice(registrationIndex, 1)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
    )
    return true
  }

  const deleteEvent = (id) => {
    const idx = events.value.findIndex((e) => e.id === Number(id))
    if (idx !== -1) {
      events.value.splice(idx, 1)
      userRegistrations.value = userRegistrations.value.filter((r) => r.eventId !== Number(id))
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: events.value, registrations: userRegistrations.value }),
      )
    }
  }

  const clearAllEvents = () => {
    events.value = []
    userRegistrations.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    events,
    totalEvents,
    activeEvents,
    completedEvents,
    userRegistrations,
    userRegistrationsCount,
    createEvent,
    registerAttendee,
    getEventById,
    getRegistrationByEventId,
    isUserRegistered,
    cancelRegistration,
    deleteEvent,
    clearAllEvents,
  }
}
