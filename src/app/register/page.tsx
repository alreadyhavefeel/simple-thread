"use client"
import Image from "next/image";
import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const router = useRouter()
    const [error, setError] = useState(null);

    const url = 'http://localhost:3001/register';
    const [formData, setFormData] = useState({ username: '', password: '' });
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    class User {
        constructor(username, password) {
            this.username = username;
            this.password = password;
            this.createdAt = new Date().getTime();
        }
    }

    const handleSubmit = () => {
        try {
            const user = new User(formData.username, formData.password);
            console.log('user:', user);
            axios.post(url, user)
                .then(response => {
                    console.log('Response data from:');
                    if (response.status === 201) {
                        router.push('/login'); // Redirect to login page
                    }
                })
                .catch(error => {
                    console.error('There was an error!', error);
                    if (error.response && error.response.status === 409) {
                        setError('User already exists. Please log in.');
                        router.push('/login'); // Redirect to login page
                    } else {
                        setError('An error occurred during registration.');
                    }
                });
        } catch (err) {
            console.error('There was an error!', err);
            setError('An error occurred during registration.');
        }
    }

    useEffect(() => {
        console.log('formData:', formData);
    }, [formData]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1>Sign up</h1>
          <input
            id="username"
            name="username"
            placeholder="Username"
            type="text"
            autoComplete="username"
            onChange={handleChange}
            required
            autoFocus
          />
          <input
            id="current-password"
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        <button type="submit" onClick={handleSubmit}>Register</button>
    </div>
  );
}