import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearNotification } from "../../store/slices/notificationSlice";
import { XMarkIcon } from "@heroicons/react/24/outline";

const TopBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { message, type, visible } = useAppSelector(
    (state) => state.notification.banner
  );

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible || !message) return null;

  const bgColor = type === "success" ? "bg-[#488010]" : "bg-red-600";

  return (
    <div className="relative z-30 mt-4">
      <div
        className={`${bgColor} text-white px-4 py-2 shadow-md flex items-center justify-between rounded-lg mx-auto w-fit`}
      >
        <div className="text-center font-medium">{message}</div>
        <button
          onClick={() => dispatch(clearNotification())}
          className="ml-2 p-1 hover:bg-black/20 rounded-full transition-colors"
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBanner;
