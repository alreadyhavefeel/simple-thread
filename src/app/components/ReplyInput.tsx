import React from "react";
import { useState, useContext, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import router from "next/router";

import { UserContext } from '../UserContext';

export default function ReplyInput (props) {
    const { user } = useContext(UserContext);
    const [value, setValue] = useState('');
    const [posts, setPosts] = useState([]);
  
    // URL of your Express server's POST endpoint
    const url = 'http://localhost:3001/api/replyposts';
  
    class replyPost {
      constructor(postId, user, replyNote) {
          this.postId = postId;
          this.name = user;
          this.replyNote = replyNote;
          this.loves = 0;
          this.timestamp = new Date().getTime();
      }
    }
  
    const handleChange = (e) => {
        setValue(e.target.value);
    }
  
    const handleSubmit = () => {
        const post = new replyPost(props.id, user.username, value);
        console.log(post)
        axios.post(url, post, { withCredentials: true })
            .then(response => {
                if (response.status === 201) {
                    console.log('Response data:', response.data);
                    setPosts([...posts, post]);
                    window.location.reload();
                } else if (response.status === 401) {
                    console.log("User noting login");
                    alert("User noting login");
                    router.push('/login');
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
          <div className="flex flex-col bg-white rounded-t-md justify-between">
                <div className="flex flex-row w-full py-2 px-5">
                    <div className='w-12 flex-none'>
                        <img className="rounded-full" src="/img/profile.jpg" alt="Profile Picture" style={{minWidth:50, minHeight:50}}/>
                    </div>
                    <div className="flex grow flex-col ml-4 relative w-full">
                        <h2 className="font-bold dark:text-black">{props.name}</h2>
                        <input 
                            value={value} 
                            onChange={handleChange}
                            type="text" 
                            placeholder={`Reply to ${props.replyto}...`}
                            className="dark:text-black py-2 outline-none w-full h-full"
                            line-hight="1.5"
                        />
                    </div>
                </div>
                <div className="py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="inline-flex w-full justify-center rounded-md px-8 py-2 text-sm border font-semibold text-black hover:text-white shadow-sm hover:bg-slate-700 sm:ml-3 sm:w-auto"
                        >
                        Post
                    </button>
                </div>
          </div>
      )
  }