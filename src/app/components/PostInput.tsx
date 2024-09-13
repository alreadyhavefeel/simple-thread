"use client"
import react  from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function PostInput(props) {
    const router = useRouter()
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
        const post = new Post(props.user , value);
        axios.post(url, post, { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    console.log('Response data:', response.data);
                    setPosts([...posts, post]);
                } else if (response.status === 401) {
                    console.log("User noting login");
                    alert("User noting login");
                    router.push('/login');
                } else {
                    console.log(error)
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    console.log("User not logged in");
                    alert("User noting login");
                    router.push('/login');
                } else {
                    console.error('There was an error!', error);
                }
        });
        setValue('');
    }

    return (
        <div className="flex flex-row bg-white p-5 rounded-t-md w-2/3 border-solid border-b justify-between">
            <div className="flex flex-row w-full">
                <div className='w-12 flex-none'>
                    <img className="rounded-full" src="/img/profile.jpg" alt="Profile Picture" style={{minWidth:50, minHeight:50}}/>
                </div>
                <div className="flex grow flex-col ml-4 relative w-full">
                    <h2 className="font-bold dark:text-black">{props.name}</h2>
                    <input 
                        value={value} 
                        onChange={handleChange}
                        type="text" 
                        placeholder="What's on your mind?"
                        className="dark:text-black mt-2 border border-gray-300 rounded-md p-2 w-full h-full"
                        line-hight="1.5"
                    />
                </div>
            </div>
            <div className="flex justify-center ml-4">
                <button 
                    onClick={handleSubmit}
                    className="font-normal px-4 rounded border-solid border"
                    >Post
                </button>
            </div> 
        </div>
    )
}