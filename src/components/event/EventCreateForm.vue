<script setup>
import { reactive, ref } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
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

const formatEventDate = (dateString) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return `${formattedDate} ${formattedTime}`
}

const handleSubmitEvent = () => {
  if (!form.title.trim() || !form.date || !form.loc.trim() || !form.desc.trim()) {
    errorMessage.value = 'Please fill in all required fields before publishing the event!'
    successMessage.value = ''
    return
  }

  emit('submit', {
    title: form.title.trim(),
    cat: form.cat,
    date: formatEventDate(form.date),
    loc: form.loc.trim(),
    quota: Number(form.quota),
    price: form.price,
    desc: form.desc.trim(),
  })

  Object.assign(form, {
    title: '',
    cat: 'Workshop',
    date: '',
    loc: '',
    quota: 100,
    price: 'Free',
    desc: '',
  })
  errorMessage.value = ''
  successMessage.value = 'Event published successfully and is now live!'

  setTimeout(() => {
    successMessage.value = ''
  }, 1000)
}
</script>

<template>
  <AppCard class="form-card">
    <h3>Create New Event Form</h3>
    <p class="form-subtitle">
      Information entered here will be instantly published to the Gatherly public catalog.
    </p>

    <div v-if="errorMessage" class="alert-box alert-error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert-box alert-success">{{ successMessage }}</div>

    <form class="event-form" @submit.prevent="handleSubmitEvent">
      <div class="form-group">
        <label for="event-title">Event Title *</label>
        <input
          id="event-title"
          v-model="form.title"
          class="form-input"
          type="text"
          placeholder="e.g. Modern UI/UX Masterclass"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="event-category">Event Category *</label>
          <select id="event-category" v-model="form.cat" class="form-input">
            <option value="Workshop">Workshop</option>
            <option value="Meetup">Meetup</option>
            <option value="Competition">Competition</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
          </select>
        </div>
        <div class="form-group">
          <label for="event-date">Date & Time *</label>
          <input
            id="event-date"
            v-model="form.date"
            class="form-input"
            type="datetime-local"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="event-location">Event Location *</label>
          <input
            id="event-location"
            v-model="form.loc"
            class="form-input"
            type="text"
            placeholder="e.g. Innovation Center, Jakarta"
            required
          />
        </div>
        <div class="form-group">
          <label for="event-quota">Attendee Quota</label>
          <input
            id="event-quota"
            v-model.number="form.quota"
            class="form-input"
            type="number"
            min="10"
            placeholder="100"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="event-price">Ticket Price</label>
        <input id="event-price" v-model="form.price" class="form-input" type="text" />
      </div>

      <div class="form-group">
        <label for="event-description">Event Description *</label>
        <textarea
          id="event-description"
          v-model="form.desc"
          class="form-input"
          rows="5"
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-secondary-action" type="button" @click="emit('cancel')">Cancel</button>
        <AppButton variant="primary">Publish Event Now</AppButton>
      </div>
    </form>
  </AppCard>
</template>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto var(--space-12);
}

h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-1);
}

.form-subtitle {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.alert-box {
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: var(--space-6);
}

.alert-error {
  background: #ffe3e3;
  color: #c92a2a;
  border: 1px solid #ffa8a8;
}

.alert-success {
  background: #d3f9d8;
  color: #2b8a3e;
  border: 1px solid #b2f2bb;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-weight: 600;
  color: var(--text-main);
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font: inherit;
  color: var(--text-main);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: white;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 68, 255, 0.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.btn-secondary-action {
  background: var(--bg-light);
  border: 1px solid var(--border-color);
  padding: var(--space-3) var(--space-6);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
