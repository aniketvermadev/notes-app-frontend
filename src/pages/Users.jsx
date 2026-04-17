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
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ width: '250px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Users</h3>

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              background: selectedUser?._id === user._id ? '#f3f3f3' : 'white',
            }}
          >
            <p style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: '12px' }}>{user.email}</p>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {selectedUser && currentUser ? (
          <Chat
            currentUserId={currentUser._id}
            otherUserId={selectedUser._id}
          />
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Users;