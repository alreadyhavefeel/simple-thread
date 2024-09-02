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
  const [user, setUser] = useState({
    id: '',
    username: ''
  });
  const url = 'http://localhost:3001/api/posts';
  const [posts, setPosts] = useState([]);

  // Check user authentication for login
  useEffect(() => {
    axios.get('http://localhost:3001/checkAuthentication', { withCredentials: true })
      .then(res => {
        console.log('Response data:', res.data);
        setLoggedIn(res.data.authenticated);
        setUser({
          id: res.data.id,
          username: res.data.username
        });
      })
      .catch(error => {
        setLoggedIn(false);
      });
  }, []);

  // useEffect(() => {
  //   const checkLoggedIn = async () => {
  //     if (loggedIn === false) {
  //       router.push('/login');
  //     } else {
  //       console.log('User is logged in');
  //       console.log('loggedIn state updated:', loggedIn);
  //     }
  //   }
  //   checkLoggedIn();
  // }, [loggedIn]);

  // Get posts from the server
  useEffect(() => {
      axios.get(url)
          .then(response => {
              // re-arrange the posts in descending order
              response.data.sort((a, b) => b.timestamp - a.timestamp);
              setPosts(response.data);
          })
          .catch(error => {
              console.error('There was an error!', error);
      });
  }, []);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
        axios.get('http://localhost:3001/logout', { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data.message);
                    setLoggedIn(false);
                    router.push('/login');
                }
            })
            .catch(error => {
                console.error('There was an error!', error);ß
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
      {loggedIn === false ?  (
        //Landing Page
        <div className="flex-1 flex-row min-h-screen min-w-screen">
          <h1 className="text-center text-2xl font-semibold">Please sign in to continue</h1>
          <div className="items-center">
            <button 
              type="button" 
              onClick={() => router.push('/login')}
              className=""
            >
              Sign-in
            </button>
          </div>
          
        </div>
       ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between">
            <div className="pl-4">
              <h1 className="my-4 font-bold text-lg">Thread</h1>
            </div>
            <h1 className="my-4 font-bold text-lg text-center items-center">Timeline</h1>
            <button className="p-4" type="button" onClick={handleLogOut}>
              Logout
            </button>
          </div>
          <div className="flex flex-col justify-center items-center">
            <PostInput name={user.username}/>
            {timelinePosts}
          </div>
        </div>
      )}
    </div>
  );
}
