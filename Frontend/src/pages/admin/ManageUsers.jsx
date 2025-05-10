import React, { useState, useEffect } from 'react';

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  useEffect(() => {
    // TODO: Fetch users from API
    // This will be implemented when backend integration is ready
    
    // Temporary mock data
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'student',
          status: 'active',
          joinDate: '2023-01-15'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'student',
          status: 'active',
          joinDate: '2023-02-20'
        },
        {
          id: 3,
          name: 'Robert Williams',
          email: 'robert.williams@example.com',
          role: 'donor',
          status: 'active',
          joinDate: '2023-03-05'
        },
        {
          id: 4,
          name: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          role: 'student',
          status: 'inactive',
          joinDate: '2023-01-10'
        },
        {
          id: 5,
          name: 'XYZ Foundation',
          email: 'contact@xyzfoundation.org',
          role: 'donor',
          status: 'active',
          joinDate: '2023-04-12'
        },
        {
          id: 6,
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          role: 'admin',
          status: 'active',
          joinDate: '2023-01-05'
        },
        {
          id: 7,
          name: 'ABC Corporation',
          email: 'scholarships@abccorp.com',
          role: 'donor',
          status: 'active',
          joinDate: '2023-05-01'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });
  
  const handleStatusToggle = (userId) => {
    // TODO: Update user status via API
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === 'active' ? 'inactive' : 'active'
        };
      }
      return user;
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add New User
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="p-2 border rounded w-full"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="donor">Donors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div>Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Join Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{user.name}</td>
                  <td className="py-3 px-6 text-left">{user.email}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'donor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={user.status === 'active'}
                        onChange={() => handleStatusToggle(user.id)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      <span className="ms-3">{user.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </label>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        View
                      </button>
                      <button className="text-yellow-500 hover:text-yellow-700">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> users
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                1
              </button>
              <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageUsers; 