"use client"
import Image from "next/image";
import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter()

  const url = 'http://localhost:3001/login';
  const [formData, setFormData] = useState({ username: '', password: '' });
  function handleChange(e) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  }

  class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
  }

  const config = {
    withCredentials: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const user = new User(formData.username, formData.password);
        axios.post(url, user, config)
            .then(response => {
                console.log('Response data from:', response.data);
                if (response.status === 200) {
                    console.log('Login successful, redirecting...');
                    router.push('/');
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    } catch (err) {
        console.error('There was an error!', err);
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1>Sign in</h1>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            onChange={handleChange}
            autoComplete="username"
            required
            autoFocus
          />
          <label htmlFor="current-password">Password</label>
          <input
            id="current-password"
            name="password"
            type="password"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        <button type="submit" onClick={handleSubmit}>Sign in</button>
        <button type="button" onClick={() => router.push('/register')}>Register</button>
    </div>
  );
}