import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const NotificationsPage = ({ user }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error) setNotifications(data);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    fetchNotifications();
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li key={notif.id} className="bg-white p-4 rounded shadow-md flex justify-between items-center">
              <div>
                <p>{notif.message}</p>
                <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
              </div>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
