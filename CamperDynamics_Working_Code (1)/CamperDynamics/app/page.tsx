'use client';
import {useEffect} from 'react';
export default function Home(){useEffect(()=>{const s=document.createElement('script');s.type='module';s.src='/portal/platform.js';window.document.body.appendChild(s);return()=>{s.remove()}},[]);return <div id="portal-root"><div className="initial-load">Preparing your next chapter…</div></div>}
