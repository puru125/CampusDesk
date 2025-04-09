// Create a custom hook for the toast functionality
import { useState, useCallback } from "react";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToastType = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

// Custom hook to provide toast functionality
export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = useCallback(
    ({ ...props }: Omit<ToastType, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((toasts) => [...toasts, { id, ...props }]);
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

// Export a standalone function for simpler imports
export const toast = ({ ...props }: Omit<ToastType, "id">) => {
  // This is just a placeholder - the real implementation
  // will use the hook above
  console.log("Toast:", props);
};
