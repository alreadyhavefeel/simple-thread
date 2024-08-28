"use client"
import react  from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { set } from 'mongoose';

export default function PostInput(props) {
    const [value, setValue] = useState('');
    const [posts, setPosts] = useState([]);

    // URL of your Express server's POST endpoint
    const url = 'http://localhost:3001/api/posts';

    class Post {
        constructor(name, note) {
            this.name = name;
            this.note = note;
            this.loves = 0;
            this.timestamp = new Date().getTime();
        }
    }

    const handleChange = (e) => {
        setValue(e.target.value);
    }

    const handleSubmit = () => {
        const post = new Post(props.name, value);
        axios.post(url, post)
            .then(response => {
                console.log('Response data:', response.data);
                setPosts([...posts, post]);
            })
            .catch(error => {
                console.error('There was an error!', error);
        });
        setValue('');
    }

    return (
        <div className="flex flex-row bg-white p-5 rounded-t-md w-2/3 border-solid border-b justify-between">
            <div className="flex flex-row">
                <div className='rounded-full'>
                    <img className="rounded-full" src="/img/profile.jpg" alt="Profile Picture" style={{width:50, height:50}}/>
                </div>
                <div className="flex flex-col ml-4 relative min-w-[300px]">
                    <h2 className="font-bold">{props.name}</h2>
                    <input value={value} onChange={handleChange} className="" type="text" placeholder="What's on your mind?" />
                </div>
            </div>
            <div className="flex justify-center ml-4">
                <button onClick={handleSubmit}>Post</button>
            </div> 
        </div>
    )
}