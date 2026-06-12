import { API_BASE_URL, fetchWithAuth } from '../api-client';

export const roomsService = {
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/rooms/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  getCategory: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/rooms/categories/${id}`);
    if (!res.ok) throw new Error('Failed to load category details');
    return res.json();
  },

  getAvailableRoomsForCategory: async (categoryId: number) => {
    return fetchWithAuth(`/rooms/available-by-category?categoryId=${categoryId}`);
  },

  updateCategoryPrice: async (id: number, category: any) => {
    return fetchWithAuth(`/rooms/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },
};
