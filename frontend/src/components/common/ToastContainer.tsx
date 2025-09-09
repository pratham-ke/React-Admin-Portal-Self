import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { removeToast } from "../../store/slices/notificationSlice";

const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((s) => s.notification.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dispatch(removeToast(t.id)), 4000));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, dispatch]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`${t.type === "success" ? "bg-[#488010]" : "bg-red-600"} text-white rounded shadow px-4 py-2 min-w-[240px]`}>{t.message}</div>
      ))}
    </div>
  );
};

export default ToastContainer;


