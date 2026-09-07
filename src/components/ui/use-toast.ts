import { toast as toastManager } from "./toast"

type ToastOptions = Parameters<typeof toastManager.add>[0]

export function useToast() {
  return {
    toast: (options: ToastOptions) => toastManager.add(options),
  }
}