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
      <div className="">
        <h1 className="text-center text-2xl font-semibold">Log in</h1>
        <div className="mt-2">
            <input
              id="username"
              name="username"
              placeholder="Username"
              type="text"
              onChange={handleChange}
              autoComplete="username"
              className="mt-2 border border-gray-300 dark:text-black rounded-lg p-4 min-w-[400px] h-full"
              required
              autoFocus
            />
        </div>
      <div className="">
          <input
            id="current-password"
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            autoComplete="current-password"
            className="mt-2 border border-gray-300 dark:text-black rounded-lg p-4 min-w-[400px] h-full"
            required
            autoFocus
          />
      </div>
      <div className="flex flex-col items-end mt-2">
        <button 
            type="submit" 
            onClick={handleSubmit}
            className="bg-slate-700 hover:bg-black dark:bg-blue-500 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 min-w-[400px] rounded-lg"
              >Log in
        </button>
        <div className="flex flex-row items-end">
          <p className="mt-2 text-sm">Don't have an account?  </p>
          <button 
            type="button" 
            onClick={() => router.push('/register')}
            className="text-blue-500 hover:text-blue-700 text-sm font-semibold rounded-lg"
              > Register
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}