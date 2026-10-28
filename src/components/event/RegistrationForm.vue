<script setup>
import { reactive, ref } from 'vue'
import { useEvents } from '@/composables/useEvents'
import AppModal from '@/components/ui/AppModal.vue'

const props = defineProps({
  event: {
    required: true,
  },
})
const emit = defineEmits(['success', 'cancel', 'error'])
const { registerAttendee } = useEvents()

const form = reactive({ fullName: '', email: '', phone: '', dob: '', reason: '' })
const errors = reactive({ fullName: '', email: '', phone: '', dob: '', reason: '' })
const errorMessage = ref('')
const isDiscardModalOpen = ref(false)

const validateField = (field) => {
  if (field === 'fullName') {
    errors.fullName = !form.fullName.trim()
      ? 'Full name is required.'
      : form.fullName.trim().length < 2
        ? 'Full name must be at least 2 characters.'
        : ''
  } else if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    errors.email = !form.email.trim()
      ? 'Email address is required.'
      : !emailRegex.test(form.email.trim())
        ? 'Please enter a valid email address.'
        : ''
  } else if (field === 'phone') {
    const phoneRegex = /^[0-9\s\-()+]{9,18}$/
    errors.phone = !form.phone.trim()
      ? 'Phone number is required.'
      : !phoneRegex.test(form.phone.trim())
        ? 'Please enter a valid phone number.'
        : ''
  } else if (field === 'dob') {
    errors.dob = !form.dob
      ? 'Date of birth is required.'
      : new Date(form.dob) > new Date()
        ? 'Date of birth cannot be in the future.'
        : ''
  } else if (field === 'reason') {
    errors.reason = !form.reason.trim()
      ? 'Reason for attending is required.'
      : form.reason.trim().length < 10
        ? 'Please write at least 10 characters.'
        : ''
  }
}

const validateAll = () => {
  Object.keys(errors).forEach(validateField)
  return Object.values(errors).every((error) => !error)
}

const handleSubmit = () => {
  errorMessage.value = ''
  if (!validateAll()) {
    errorMessage.value = 'Please correct the highlighted fields before submitting.'
    return
  }

  const record = registerAttendee(props.event.id, {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    dob: form.dob,
    reason: form.reason.trim(),
  })

  if (record) emit('success', record)
  else errorMessage.value = 'Unable to complete registration. Please check remaining seats.'
}

const handleCancelClick = () => {
  const isFormDirty = Object.values(form).some((value) => String(value).trim())
  if (isFormDirty) isDiscardModalOpen.value = true
  else emit('cancel')
}

const handleDiscard = () => {
  isDiscardModalOpen.value = false
  emit('cancel')
}
</script>

<template>
  <div class="registration-form-wrapper">
    <div class="form-card">
      <header class="form-header">
        <h2>Registration Form</h2>
        <p>Fill out the attendee information below to confirm your participation.</p>
      </header>

      <div v-if="errorMessage" class="alert-box alert-error">{{ errorMessage }}</div>

      <form class="attendee-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="fullName">Full Name <span class="required">*</span></label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="e.g. John Doe"
            autocomplete="name"
            @blur="validateField('fullName')"
          />
          <span v-if="errors.fullName" class="field-error">{{ errors.fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email Address <span class="required">*</span></label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="e.g. name@example.com"
            autocomplete="email"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number <span class="required">*</span></label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="e.g. 81234567890"
            autocomplete="tel"
            @blur="validateField('phone')"
          />
          <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="dob">Date of Birth <span class="required">*</span></label>
          <input id="dob" v-model="form.dob" type="date" @blur="validateField('dob')" />
          <span v-if="errors.dob" class="field-error">{{ errors.dob }}</span>
        </div>

        <div class="form-group">
          <label for="reason">Reason for Attending <span class="required">*</span></label>
          <textarea
            id="reason"
            v-model="form.reason"
            rows="4"
            @blur="validateField('reason')"
          ></textarea>
          <span v-if="errors.reason" class="field-error">{{ errors.reason }}</span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel-form" @click="handleCancelClick">Cancel</button>
          <button type="submit" class="btn-submit-form">Submit Registration</button>
        </div>
      </form>
    </div>

    <AppModal
      :is-open="isDiscardModalOpen"
      title="Discard Registration?"
      message="Your registration details will be lost."
      confirm-text="Discard"
      cancel-text="Continue Editing"
      @confirm="handleDiscard"
      @close="isDiscardModalOpen = false"
    />
  </div>
</template>

<style scoped>
.form-card {
  padding: var(--space-8);
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--space-4);
  box-shadow: 0 4px 20px rgba(2, 0, 2, 0.03);
}

.form-header h2 {
  font-size: 1.6rem;
  color: var(--text-main);
  margin-bottom: var(--space-1);
}

.form-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: var(--space-6);
}

.alert-box {
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  margin-bottom: var(--space-6);
}

.alert-error {
  background: #ffe3e3;
  color: #c92a2a;
  border: 1px solid #ffa8a8;
}

.attendee-form,
.form-group {
  display: flex;
  flex-direction: column;
}

.attendee-form {
  gap: var(--space-4);
}

.form-group {
  gap: var(--space-2);
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.required,
.field-error {
  color: #c92a2a;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font: inherit;
  color: var(--text-main);
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 68, 255, 0.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.btn-cancel-form,
.btn-submit-form {
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel-form {
  background: var(--bg-light);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-submit-form {
  background: var(--primary);
  color: white;
  border: 0;
}

.btn-submit-form:hover {
  background: var(--primary-hover);
}
</style>
