import { ref } from 'vue'

const baseURL = 'https://api.gatherly.local/v1'

// Check if we're in development mode with mock server
const isDevelopment = import.meta.env.DEV

// Mock data fallback - digunakan kalau API gagal atau di development tanpa server
const mockEvents = [
  {
    id: 1,
    title: 'Modern UI/UX Workshop',
    date: '2024-11-15',
    loc: 'Innovation Center, Jakarta',
    cat: 'Workshop',
    desc: 'Learn modern UI/UX design principles with hands-on exercises.',
    quota: 50,
    price: 'Free',
    done: false,
  },
  {
    id: 2,
    title: 'React Conference 2024',
    date: '2024-12-05',
    loc: 'Pacific Hall, Bandung',
    cat: 'Conference',
    desc: 'Annual React developer conference with industry leaders.',
    quota: 200,
    price: 150000,
    done: false,
  },
]

export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)

  const request = async (endpoint, options = {}) => {
    isLoading.value = true
    error.value = null

    const url = `${baseURL}${endpoint}`

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        )
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Network error'
      console.error('API Error:', err)
      // Return mock data di development kalau API gagal
      if (isDevelopment && options.returnMock !== false) {
        return options.returnMock === true ? mockEvents : null
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getEvents = async (returnMock = true) => {
    return await request('/events', { returnMock })
  }

  const getEventById = async (id, returnMock = true) => {
    return await request(`/events/${id}`, { returnMock })
  }

  const registerAttendee = async (eventId, participantData) => {
    return await request('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        ...participantData,
      }),
    })
  }

  const getMyRegistrations = async () => {
    return await request('/my-registrations')
  }

  const cancelRegistration = async (registrationId) => {
    return await request(`/registrations/${registrationId}`, {
      method: 'DELETE',
    })
  }

  return {
    isLoading,
    error,
    getEvents,
    getEventById,
    registerAttendee,
    getMyRegistrations,
    cancelRegistration,
    request,
  }
}