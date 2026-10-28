<script setup>
import { ref, reactive, computed } from 'vue'
import { useEvents } from '@/composables/useEvents'
import AppCard from '@/components/ui/AppCard.vue'
import AppModal from '@/components/ui/AppModal.vue'

defineProps({
  event: {
    required: true,
  },
})
const emit = defineEmits(['success', 'cancel'])

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  reason: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  reason: '',
})

const validateField = (field) => {
  if (field === 'fullName') {
    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.'
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.'
    } else {
      errors.fullName = ''
    }
  } else if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).'
    } else {
      errors.email = ''
    }
  } else if (field === 'phone') {
    const phoneRegex = /^[0-9\s\-\(\)]{9,16}$/
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(form.phone.trim())) {
      errors.phone = 'Please enter a valid phone number (minimum 9 digits).'
    } else {
      errors.phone = ''
    }
  } else if (field === 'dob') {
    if (!form.dob) {
      errors.dob = 'Date of birth is required.'
    } else if (new Date(form.dob) > new Date()) {
      errors.dob = 'Date of birth cannot be in the future.'
    } else {
      errors.dob = ''
    }
  } else if (field === 'reason') {
    if (!form.reason.trim()) {
      errors.reason = 'Reason for attending is required.'
    } else if (form.reason.trim().length < 10) {
      errors.reason = 'Please write at least 10 characters explaining your reason.'
    } else {
      errors.reason = ''
    }
  }
}

const validateAll = () => {
  validateField('fullName')
  validateField('email')
  validateField('phone')
  validateField('dob')
  validateField('reason')
  return !(errors.fullName || errors.email || errors.phone || errors.dob || errors.reason)
}

const handleSubmit = () => {
  if (!validateAll()) {
    emit('error', 'Please correct the highlighted fields before submitting.')
    return
  }

  const record = registerAttendee(props.event.id, {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    dob: form.dob,
    reason: form.reason.trim(),
  })

  if (record) {
    emit('success', record)
  } else {
    emit('error', 'Unable to complete registration. Please check remaining seats.')
  }
}

const handleCancelClick = () => {
  const isFormDirty =
    form.fullName.trim() || form.email.trim() || form.phone.trim() || form.dob || form.reason.trim()
  if (isFormDirty) {
    isDiscardModalOpen.value = true
  } else {
    emit('cancel')
  }
}
</script>

<template>
  <div class="registration-form-wrapper">
    <div class="form-card">
      <header class="form-header">
        <h2>Registration Form</h2>
        <p>Fill out the attendee information below to confirm your participation.</p>
      </header>

      <div class="error-banner" v-if="errorMessage">
        <span class="field-error">{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="attendee-form">
        <div class="form-group">
          <label for="fullName">Full Name <span class="required">*</span></label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="e.g. John Doe"
            autocomplete="name"
            @input="fullName && validateField('fullName')"
          />
          <span v-if="fullName" class="field-error">{{ fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email Address <span class="required">*</span></label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="e.g. name@example.com"
            autocomplete="email"
            @input="email && validateField('email')"
          />
          <span v-if="email" class="field-error">{{ email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number <span class="required">*</span></label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="e.g. 81234567890"
            autocomplete="tel"
            @input="phone && validateField('phone')"
          />
          <span v-if="phone" class="field-error">{{ phone }}</span>
        </div>

        <div class="form-group">
          <label for="dob">Date of Birth <span class="required">*</span></label>
          <input id="dob" v-model="form.dob" type="date" @change="dob && validateField('dob')" />
          <span v-if="dob" class="field-error">{{ dob }}</span>
        </div>

        <div class="form-group">
          <label for="reason">Reason for Attending <span class="required">*</span></label>
          <textarea v-model="form.reason" @input="reason && validateField('reason')"></textarea>
          <span v-if="reason" class="field-error">{{ reason }}</span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel-form" @click="handleCancelClick">Cancel</button>
          <button type="submit" class="btn-submit-form">Submit Registration</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  padding: var(--space-8);
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--space-4);
  box-shadow: 0 4px 20px rgba(2, 0, 2, 0.03);
  margin-bottom: var(--space-6);
}

.form-header {
  font-size: 1.6rem;
  color: var(--text-main);
  margin-bottom: var(--space-1);
}

.form-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: var(--space-6);
}

.alert-box {
  padding: var(--space-3) var(--space-4);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: var(--space-6);
}

.alert-error {
  background: #ffe3e3;
  color: #c92a2a;
  border: 1px solid #ffa8a8;
}

.alert-success {
  background: #d39d8c;
  color: #2b8a3e;
  border: 1px solid #b2f2bb;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: var(--space-4);
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.25s,
    background-color 0.25s;
  box-sizing: border-box;
  font-size: 0.95rem;
  color: var(--text-main);
  background: #fafafa;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 3px rgba(102, 68, 255, 0.15);
}

.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  resize: vertical;
  line-height: 1.55;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text-main);
  background: #fafafa;
  transition:
    border-color 0.2s,
    box-shadow 0.25s;
}

.form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 3px rgba(102, 68, 255, 0.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: 10px;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.btn-cancel-form {
  background: var(--bg-light);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-cancel-form:hover {
  background: #e2e8f0;
  color: var(--text-main);
}

.btn-submit-form {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
  padding: 10px 24px;
}

.btn-submit-form:hover {
  background: #5032d6;
}

.btn-submit-form:active {
  transform: scale(0.98);
}
</style>
