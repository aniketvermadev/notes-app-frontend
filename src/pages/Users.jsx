import React, { useEffect, useState } from 'react';
import Chat from '../components/Chat';
import API from '../services/api';

const Users = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [meRes, usersRes] = await Promise.all([
          API.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          API.get('/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        setCurrentUser(meRes.data.user);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-[70vh] bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="md:flex">
          {/* Sidebar */}
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="p-4">
              <h3 className="text-lg font-semibold">People</h3>
              <p className="text-sm text-gray-500 mt-1">Select someone to chat with</p>
            </div>

            <div className="px-4 pb-4">
              <div className="mt-2">
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                  {users.map((user) => {
                    const isSelected = selectedUser?._id === user._id;
                    const initials = user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U';

                    return (
                      <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                          {initials}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="p-4 md:p-6">
              {selectedUser && currentUser ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                        {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{selectedUser.name}</div>
                        <div className="text-xs text-gray-500">{selectedUser.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[70vh]">
                    <Chat
                      currentUserId={currentUser._id}
                      otherUserId={selectedUser._id}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-lg font-medium">Select a user to start chatting</p>
                  <p className="text-sm mt-2">Choose someone from the left to open the chat</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Users;