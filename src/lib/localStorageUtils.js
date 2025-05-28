
    export const getFromLocalStorage = (key, defaultValue = null) => {
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null || storedValue === undefined) return defaultValue;
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        localStorage.removeItem(key); 
        return defaultValue;
      }
    };
    
    export const saveToLocalStorage = (key, value) => {
      try {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
      }
    };

    export const removeFromLocalStorage = (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from localStorage key "${key}":`, error);
      }
    };
  