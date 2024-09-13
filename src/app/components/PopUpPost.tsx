'use client'

import { useState, useEffect, useContext } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import axios from 'axios';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import OverlayPost from './OverlayPost'
import ReplyInput from './ReplyInput';
import moment from 'moment';

import { UserContext } from '../UserContext';

export default function PopUpPost(props) {
  const { user } = useContext(UserContext);
  console.log("Log user from reply post", user)
  const [open, setOpen] = useState(true)
  const [post, setPost] = useState([]);

  const url = 'http://localhost:3001/api/posts';
  useEffect(() => {
    axios.get(`${url}/${props.id}`)
        .then(response => {
            // re-arrange the posts in descending order
            console.log('respone data',response.data)
            setPost(response.data);
        })
        .catch(error => {
            console.error('There was an error!', error);
    });
    }, []);



const RieplyInput = (props)=> {
  const [value, setValue] = useState('');
  const [posts, setPosts] = useState([]);

  // URL of your Express server's POST endpoint
  const url = 'http://localhost:3001/api/posts';

  class replyPost {
    constructor(id, user, note) {
        this.post_id = props.id;
        this.username = user.username;
        this.note = note;
        this.loves = 0;
        this.timestamp = new Date().getTime();
    }
  }

  const handleChange = (e) => {
      setValue(e.target.value);
  }

  const handleSubmit = () => {
      const post = new replyPost(props.id, user.username, value);
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
        <div className="flex flex-row bg-white px-5 rounded-t-md justify-between">
            <div className="flex flex-row w-full py-2">
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
        </div>
    )
}

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
                <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                    <OverlayPost name={post.name} updatetime={moment(post.timestamp).fromNow()} note={post.note}/>
                    {/* <RieplyInput name={user.username} replyto={post.name} /> */}
                    <ReplyInput id={post._id} name={user.username} replyto={post.name} />
                </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
