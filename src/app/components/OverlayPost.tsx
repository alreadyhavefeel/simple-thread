"use client"
import react from 'react';
import Popup from 'reactjs-popup';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function OverlayPost(props) {

const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-row bg-white p-5 w-2/3 justify-between">
            <div className="flex flex-row">
                <div className='w-12'>
                    <img className="rounded-full" src="/img/profile.jpg" alt="Profile Picture" style={{minWidth:50, minHeight:50}}/>
                </div>
                <div className="flex flex-col ml-4">
                    <div className="flex flex-row items-center">
                        <h2 className="font-bold dark:text-black">{props.name}</h2>
                        <p className="ml-2 dark:text-black font-light text-sm">{props.updatetime}</p>
                    </div>
                    <p className="dark:text-black">{props.note}</p>
                </div>
            </div>
           
        </div>
    )
}

