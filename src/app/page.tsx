"use client"
import Image from "next/image";
import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import PostInput from "./components/PostInput";
import TimelinePost from "./components/TimelinePost";
import { useRouter } from 'next/navigation';
import { set } from "mongoose";

export default function Home() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false);
  const url = 'http://localhost:3001/api/posts';
  const [posts, setPosts] = useState([]);

  // Check user authentication for login
  useEffect(() => {
    axios.get('http://localhost:3001/checkAuthentication', { withCredentials: true })
      .then(res => {
        console.log('Response data:', res.data);
        setLoggedIn(res.data.authenticated);
      })
      .catch(error => {
        setLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    console.log('loggedIn state updated:', loggedIn);
  }, [loggedIn]);

  // Get posts from the server
  useEffect(() => {
      axios.get(url)
          .then(response => {
              setPosts(response.data);
          })
          .catch(error => {
              console.error('There was an error!', error);
      });
  }, []);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
        axios.post('http://localhost:3001/logout', { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setLoggedIn(false);
                    router.push('/login');
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    } catch (err) {
        console.error('There was an error!', err);
    }
  }



  const handleLove = (id: number) => {
  const post = posts.find(post => post._id === id);
    post.loves += 1;
    axios.put(`${url}/${id}`, post)
        .then(response => {
            console.log('Response data:', response.data);
            setPosts([...posts]);
        })
        .catch(error => {
            console.error('There was an error!', error);
    });
  }

  const timelinePosts = posts.map((post, index) => {
      return (
        <TimelinePost key={index} id={post._id} name={post.name} note={post.note} updatetime={moment(post.timestamp).fromNow()} loves={post.loves} handleClick={handleLove}/>
      );
    }
  );

  
  return (
    <div className="flex h-full w-full">
      {loggedIn===false ?  ( 
        <div className="flex flex-col items-center">
          <button type="button" onClick={() => router.push('/login')}>
            Sign-in
          </button>
        </div>
       ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between">
            <Image src="/img/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="mb-2 font-bold text-xl text-center items-center">Timeline</h1>
            <button type="button" onClick={handleLogOut}>
              Logout
            </button>
          </div>
          <div className="flex flex-col justify-center items-center">
            <PostInput name="s.fillfeel"/>
            {timelinePosts}
          </div>
        </div>
      )}
    </div>
  );
}
