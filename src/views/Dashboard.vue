<script setup>
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const { events, totalEvents, activeEvents, completedEvents } = useEvents()
</script>

<template>
  <div class="dashboard-overview">
    <div class="dashboard-header">
      <div>
        <h2>Organizer Analytics & Overview</h2>
        <p class="subtitle">
          Monitor real-time statistics and track status across all managed events
        </p>
      </div>
      <AppButton variant="primary" @click="router.push('/dashboard/events')"
        >Manage Events</AppButton
      >
    </div>

    <div class="metrics-grid">
      <AppCard class="metric-card">
        <h3 class="metric-label">Total Events</h3>
        <p class="metric-value">{{ totalEvents }}</p>
        <p class="metric-hint">All recorded events</p>
      </AppCard>
      <AppCard class="metric-card">
        <h3 class="metric-label">Active Events</h3>
        <p class="metric-value text-success">{{ activeEvents.length }}</p>
        <p class="metric-hint">Live in public catalog</p>
      </AppCard>
      <AppCard class="metric-card">
        <h3 class="metric-label">Completed Events</h3>
        <p class="metric-value text-muted">{{ completedEvents.length }}</p>
        <p class="metric-hint">Archived completed events</p>
      </AppCard>
    </div>

    <AppCard class="data-table-container">
      <div class="table-header">
        <div>
          <h3>Recent Events Status Overview</h3>
          <p class="table-subtitle">
            Master registry of all events managed across the Gatherly platform.
          </p>
        </div>
        <AppButton
          variant="primary"
          class="btn-manage-link"
          @click="router.push('/dashboard/events')"
          >Open Event Management</AppButton
        >
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Category</th>
              <th>Date & Location</th>
              <th>Quota</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="events.length === 0">
              <td colspan="5" class="empty-table-cell">No events recorded in the system yet.</td>
            </tr>
            <tr v-else v-for="item in events" :key="item.id">
              <td class="font-semibold">{{ item.title }}</td>
              <td>{{ item.cat }}</td>
              <td>{{ item.date }} · {{ item.loc }}</td>
              <td>{{ item.quota }} Pax</td>
              <td>
                <span :class="['status-badge', item.done ? 'status-completed' : 'status-active']">
                  {{ item.done ? 'Completed' : 'Active' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.dashboard-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.dashboard-header h2 {
  font-size: 2rem;
  color: var(--text-main);
  margin-bottom: var(--space-1);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.metric-card {
  padding: var(--space-6);
  text-align: center;
}

.metric-card h3 {
  font-size: 0.95rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-2);
}

.metric-value {
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.metric-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.text-success {
  color: #2ecc71;
}

.text-muted {
  color: var(--text-muted);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.table-header h3 {
  font-size: 1.3rem;
  margin-bottom: var(--space-1);
}

.table-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn-manage-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0;
}

.btn-manage-link:hover {
  text-decoration: underline;
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--bg-gray);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.data-table td {
  color: var(--text-main);
  font-size: 0.95rem;
}

.empty-table-cell {
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-8) !important;
}

.font-semibold {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.status-completed {
  background: rgba(102, 112, 133, 0.1);
  color: var(--text-muted);
}
</style>
