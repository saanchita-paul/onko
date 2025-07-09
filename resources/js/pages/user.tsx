import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
    name: string;
    created_at: string;
}

const UserTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get<User[]>('/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    return (
        <div className="container mt-4">
            <h2>User List</h2>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>User Name</th>
                    <th>Registration Date</th>
                </tr>
                </thead>
                <tbody>
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={2}>No users found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
