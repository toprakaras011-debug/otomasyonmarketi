"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationBannerProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-900 dark:text-green-100",
    message: "text-green-700 dark:text-green-300",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-100",
    message: "text-red-700 dark:text-red-300",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-900 dark:text-yellow-100",
    message: "text-yellow-700 dark:text-yellow-300",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-100",
    message: "text-blue-700 dark:text-blue-300",
  },
};

export function NotificationBanner({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];
  const color = colors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out",
        color.bg,
        color.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", color.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-sm font-medium", color.title)}>
            {title}
          </h3>
          {message && (
            <p className={cn("mt-1 text-sm", color.message)}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5",
            color.icon
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Global notification state
let notifications: Array<{
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}> = [];

let listeners: Array<() => void> = [];

export function useNotificationBanners() {
  const [, forceUpdate] = useState({});

  const rerender = () => {
    forceUpdate({});
  };

  useEffect(() => {
    listeners.push(rerender);
    return () => {
      listeners = listeners.filter(listener => listener !== rerender);
    };
  }, []);

  return notifications;
}

export function showNotificationBanner(
  type: NotificationType,
  title: string,
  message?: string,
  duration?: number
) {
  const id = Date.now().toString();
  const notification = { id, type, title, message, duration };
  
  notifications.push(notification);
  
  // Auto remove after duration
  if (duration !== 0) {
    setTimeout(() => {
      removeNotificationBanner(id);
    }, duration || 5000);
  }
  
  // Notify listeners
  listeners.forEach(listener => listener());
  
  return id;
}

export function removeNotificationBanner(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  listeners.forEach(listener => listener());
}

export function NotificationBannerContainer() {
  const notifications = useNotificationBanners();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto max-w-2xl mx-auto">
          <NotificationBanner
            type={notification.type}
            title={notification.title}
            message={notification.message}
            duration={0} // Disable auto-close since we handle it globally
            onClose={() => removeNotificationBanner(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Global helper function for easy usage
export const notification = {
  success: (title: string, message?: string, duration?: number) =>
    showNotificationBanner("success", title, message, duration),
  error: (title: string, message?: string, duration?: number) =>
    showNotificationBanner("error", title, message, duration),
  warning: (title: string, message?: string, duration?: number) =>
    showNotificationBanner("warning", title, message, duration),
  info: (title: string, message?: string, duration?: number) =>
    showNotificationBanner("info", title, message, duration),
};
