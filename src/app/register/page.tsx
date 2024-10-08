"use client"
import Image from "next/image";
import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from "react-password-checklist"

export default function Login() {
    const router = useRouter()
    const [errorMessage, setErrorMessage] = useState('');

    const [password, setPassword] = useState("")
	const [passwordAgain, setPasswordAgain] = useState("")
    
    const url = 'http://localhost:3001/register';
    const [formData, setFormData] = useState({ username: ''});
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
            const user = new User(formData.username, password);
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
                        setErrorMessage('User already exists. Plese log in.'), 
                        setTimeout(() => {
                            router.push('./login');// Redirect to login page
                        },3000)
                    } else {
                        setErrorMessage('An error occurred during registration.');
                    }
                });
        } catch (err) {
            console.error('There was an error!', err);
            setErrorMessage('An error occurred during registration.');
        }
    }

    useEffect(() => {
        console.log('formData:', formData);
    }, [formData]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="">
        <h1 className="text-center text-2xl font-semibold">Sign up</h1>
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
      <div className="flex flex-col">
        <form>
            <input
                id="current-password"
                name="password"
                placeholder="Password"
                type="password"
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="flex mt-2 border border-gray-300 dark:text-black rounded-lg p-4 min-w-[400px] h-full"
                required
                autoFocus
            />
            <input
                id="current-password"
                name="password"
                placeholder="Confirm Password"
                type="password"
                onChange={e => setPasswordAgain(e.target.value)}
                autoComplete="current-password"
                className="flex mt-2 border border-gray-300 dark:text-black rounded-lg p-4 min-w-[400px] h-full"
                required
                autoFocus
            />
            <PasswordChecklist
                    rules={["minLength","specialChar","number","capital","match"]}
                    minLength={8}
                    value={password}
                    valueAgain={passwordAgain}
                    onChange={(isValid) => {}}
                />
        </form>
      </div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
      <div className="flex flex-col items-end mt-2">
        <button 
            type="submit" 
            onClick={handleSubmit}
            className="bg-slate-700 hover:bg-black dark:bg-blue-500 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 min-w-[400px] rounded-lg"
              >Sign up
        </button>
        <div className="flex flex-row items-end">
          <p className="mt-2 text-sm">Do you have an account?</p>
          <button 
            type="button" 
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:text-blue-700 text-sm font-semibold rounded-lg"
              > Log in
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}