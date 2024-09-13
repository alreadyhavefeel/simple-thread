"use client"
import Image from "next/image";
import react from 'react';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import PostInput from "./components/PostInput";
import TimelinePost from "./components/TimelinePost";
import ReplyPost from "./components/ReplyPost";
import { useRouter } from 'next/navigation';
import { set } from "mongoose";
import { UserContext } from './UserContext';

export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false);
  const postUrl = 'http://localhost:3001/api/posts';
  const replyUrl = 'http://localhost:3001/api/replyposts';
  const [posts, setPosts] = useState([]);
  const [postsReplies, setPostReplies] = useState([]);

  const config = {
    withCredentials: true,
  };
  

  // Check user authentication for login
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const res = await axios.get('http://localhost:3001/checkAuthentication', config);
        console.log('Response data:', res.data);
        console.log('Response Auth:', res.data.authenticated);
        setLoggedIn(res.data.authenticated);
        setUser({
          id: res.data.id,
          username: res.data.username
        });
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLoggedIn(false);
      }
    };

    checkAuthentication(); // Call the async function
  }, []); // Empty dependency array to run once on component mount

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [response1, response2] = await Promise.all([
          axios.get(postUrl),
          axios.get(replyUrl),
        ]);
        //Combine and sort posts from both APIs in descending order
        const combinedPosts = [...response1.data, ...response2.data];
        combinedPosts.sort((a, b) => b.timestamp - a.timestamp);
        setPosts(combinedPosts);
      } catch (error) {
        console.error('There was an error!', error);
      }
    };
  
    fetchPosts();
  }, []);

  //fetch post with replies
  useEffect(() => {
    const fetchPostsWithReplies = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/postsWithReplies'); // Single API request
        const postsWithReplies = response.data;
        
        // Sort the posts by timestamp if needed (already sorted in backend)
        setPostReplies(postsWithReplies);
      } catch (error) {
        console.error('There was an error fetching posts with replies!', error);
      }
    };
  
    fetchPostsWithReplies();
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

  // Flatten posts and replies into a single array
const combinedPostsAndReplies = postsReplies.flatMap(post => {
  // Create an array where the first item is the post, followed by its replies
  const repliesWithPostInfo = post.replies.map(reply => ({
    ...reply,
    isReply: true,   // Mark this as a reply
    replyTo: post.name, // Keep track of the original post name
  }));

  return [
    { ...post, isReply: false }, // Mark this as a post
    ...repliesWithPostInfo,      // Spread replies into the array
  ];
});

// Sort the combined array by timestamp
const sortedTimeline = combinedPostsAndReplies.sort((a, b) => b.timestamp - a.timestamp);

// Map through the sorted array and render posts/replies
const timelinePosts = sortedTimeline.map((item, index) => {
  if (item.isReply) {
    // Render a reply
    return (
      <TimelinePost
        key={index}
        id={item._id}
        name={item.name} 
        replyNote={item.replyNote} // For replies, show the replyNote
        updatetime={moment(item.timestamp).fromNow()} 
        loves={0} // Assume replies don't have love count, adjust if needed
        handleClick={null} // No love button for replies
        replyto={item.replyTo} // Pass the original post name
      />
    );
  } else {
    // Render a main post
    return (
      <TimelinePost
        key={index}
        id={item._id}
        name={item.name} 
        note={item.note} // For main posts, show the note
        updatetime={moment(item.timestamp).fromNow()} 
        loves={item.loves}
        handleClick={handleLove}
        replyto={''} // No replyto for main post
      />
    );
  }
});

  
  return (
    <div className="flex h-full w-full">
      {loggedIn === false ?  (
        //Landing Page
        <div className="flex min-h-screen min-w-screen w-full flex-col items-center justify-center">
            <div className="flex justify-center">
              <h1 className="flex justify-center text-2xl font-semibold">Please sign in to continue</h1>
            </div>
            <div className="flex justify-center mt-2">
              <button 
                type="button" 
                onClick={() => router.push('/login')}
                className="bg-slate-700 hover:bg-black dark:bg-blue-500 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 min-w-[400px] rounded-lg"
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


