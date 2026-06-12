import { fetchWithAuth } from '../api-client';

export const housekeepingService = {
  getHousekeepingTasks: async () => {
    return fetchWithAuth('/housekeeping/tasks');
  },

  claimHousekeepingTask: async (taskId: number) => {
    return fetchWithAuth(`/housekeeping/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  },

  completeHousekeepingTask: async (taskId: number, notes?: string) => {
    return fetchWithAuth(`/housekeeping/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
};
