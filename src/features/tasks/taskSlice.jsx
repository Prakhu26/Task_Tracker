import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage - now stores all tasks for all users
const loadTasks = () => {
  const data = localStorage.getItem('tasks');
  return data ? JSON.parse(data) : [];
};

// Save to localStorage
const saveTasks = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState: loadTasks(),
  reducers: {
    addTask: (state, action) => {
      state.push(action.payload);
      saveTasks(state);
    },
    updateTask: (state, action) => {
      const index = state.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
        saveTasks(state);
      }
    },
    deleteTask: (state, action) => {
      const newState = state.filter(task => task.id !== action.payload);
      saveTasks(newState);
      return newState;
    },
    // Optional: Clear all tasks for a specific user (useful for cleanup)
    clearUserTasks: (state, action) => {
      const newState = state.filter(task => task.userId !== action.payload);
      saveTasks(newState);
      return newState;
    },
  },
});

export const { addTask, updateTask, deleteTask, clearUserTasks } = taskSlice.actions;
export default taskSlice.reducer;