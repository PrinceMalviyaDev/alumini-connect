import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Bell, CheckCheck, UserCheck, UserX, Clock, Star, Calendar } from 'lucide-react';
import { Notification } from '../types';
import { useNotificationStore } from '../store/notificationStore';

function getNotificationIcon(type: Notification['type']) {
  const base = 'w-5 h-5';
  switch (type) {
    case 'request_received': return <UserCheck className={`${base} text-blue-500`} />;
    case 'request_accepted': return <CheckCheck className={`${base} text-green-500`} />;
    case 'request_declined': return <UserX className={`${base} text-red-500`} />;
    case 'session_reminder': return <Clock className={`${base} text-yellow-500`} />;
    case 'feedback_received': return <Star className={`${base} text-purple-500`} />;
    case 'session_completed': return <Calendar className={`${base} text-green-500`} />;
    default: return <Bell className={`${base} text-gray-500`} />;
  }
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};

  notifications.forEach((notif) => {
    const date = new Date(notif.createdAt);
    let key: string;
    if (isToday(date)) key = 'Today';
    else if (isYesterday(date)) key = 'Yesterday';
    else if (isThisWeek(date)) key = 'This Week';
    else key = 'Older';

    if (!groups[key]) groups[key] = [];
    groups[key].push(notif);
  });

  return groups;
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Older'];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAllRead, markOneRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const VALID_ROUTES = ['/dashboard', '/requests', '/sessions', '/directory', '/leaderboard', '/profile', '/notifications', '/admin'];

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markOneRead(notif._id);
    }
    if (notif.link && VALID_ROUTES.includes(notif.link)) {
      navigate(notif.link);
    }
  };

  const groups = groupByDate(notifications);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            When you receive mentorship requests or updates, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.filter((g) => groups[g]?.length > 0).map((group) => (
            <div key={group}>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {group}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                {groups[group].map((notif) => (
                  <button
                    key={notif._id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
                      !notif.isRead ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5 ${
                      !notif.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
