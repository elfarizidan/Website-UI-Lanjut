import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'gatherly_events'
const savedData = localStorage.getItem(STORAGE_KEY)
const events = ref(savedData ? JSON.parse(savedData) : [])

const userRegistrations = ref(savedData ? JSON.parse(savedData).registrations : [])

watch(
  events,
  (newEvents) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents))
  },
  { deep: true },
)

watch(
  userRegistrations,
  (newRegs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: newEvents, registrations: newRegs }))
  },
  { deep: true },
)

export function useEvents() {
  const totalEvents = computed(() => events.value.length)
  const activeEvents = computed(() => events.value.filter((e) => !e.done))
  const completedEvents = computed(() => events.value.filter((e) => e.done))

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
    createEvent,
    registerAttendee,
    getEventById,
    getRegistrationByEventId,
    deleteEvent,
    clearAllEvents,
  }
}
