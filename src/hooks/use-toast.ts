
import { useState, useCallback } from "react";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToastType = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

const TOAST_TIMEOUT = 5000; // 5 seconds

// Custom hook to provide toast functionality
export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = useCallback(
    ({ ...props }: Omit<ToastType, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      // Add the toast to the array
      setToasts((toasts) => [...toasts, { id, ...props }]);
      
      // Set a timeout to automatically dismiss the toast
      setTimeout(() => {
        setToasts((toasts) => toasts.filter((t) => t.id !== id));
      }, TOAST_TIMEOUT);
      
      return id;
    },
    [setToasts]
  );

  const dismiss = useCallback((toastId?: string) => {
    setToasts((toasts) => 
      toastId 
        ? toasts.filter((toast) => toast.id !== toastId) 
        : []
    );
  }, [setToasts]);

  return {
    toast,
    dismiss,
    toasts,
  };
}

// Create a standalone toast function that uses the same signature
const toastState = {
  toasts: [] as ToastType[],
  listeners: new Set<Function>(),
};

// Function to update all listeners
const updateListeners = () => {
  toastState.listeners.forEach(listener => listener(toastState.toasts));
};

// Export a standalone function for simpler imports
export const toast = ({ ...props }: Omit<ToastType, "id">) => {
  const id = Math.random().toString(36).substring(2, 9);
  
  // Add toast to our global state
  toastState.toasts = [...toastState.toasts, { id, ...props }];
  updateListeners();
  
  // Auto dismiss
  setTimeout(() => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    updateListeners();
  }, TOAST_TIMEOUT);
  
  return id;
};
