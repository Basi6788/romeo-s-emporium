import React, { useEffect, useState } from 'react';
import { Bell, Package, X } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminNotifications: React.FC = () => {
  const { isAdmin } = useAuth();
  const { newOrder } = useRealtimeOrders(isAdmin);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (newOrder) {
      setNotifications(prev => [newOrder, ...prev].slice(0, 10));
    }
  }, [newOrder]);

  if (!isAdmin) return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <Link
                  key={notification.id || idx}
                  to="/admin/orders"
                  onClick={() => setShowPanel(false)}
                  className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      New order from {notification.customer_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${Number(notification.total).toFixed(2)} • {notification.items?.length || 0} items
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => {
                  setNotifications([]);
                  setShowPanel(false);
                }}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
