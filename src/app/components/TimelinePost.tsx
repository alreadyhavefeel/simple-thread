"use client"
import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TimelinePost(props) {
    
    return (
        <div className="flex flex-row bg-white p-5 w-2/3 border-solid border-b justify-between">
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
                    <div>
                        <button onClick={()=> props.handleClick(props.id)} className="">
                            <img src={`/icon/${props.loves > 0 ? 'love-it.png': 'love.png'}`} alt="Love" style={{width:15, height:15}}/>
                        </button>
                        <p className={`inline-block font-light text-sm items-center ${parseInt(props.loves) > 0 ? 'ml-1' : ''}`}>{props.loves === 0 ? '' : props.loves}</p>
                        <button className="ml-4">
                            <img src={`/icon/${props.loves > 0 ? 'comment.png': 'comment.png'}`} alt="Comment" style={{width:15, height:15}}/>
                        </button>
                        <button className="ml-4">
                            <img src="/icon/re.png" alt="Re" style={{width:15, height:15}}/>
                        </button>
                    </div>
                </div>
            </div>
           
        </div>
    )
}