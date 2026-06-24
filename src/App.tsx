import React, { useEffect, useState } from 'react';
import MainView from './components/MainView';
import AugmentedView from './components/AugmentedView';
import ExportEditPDF from './components/ExportEditPDF';
import AdminView from './components/AdminView';
import { Toast } from './components/Common';

function currentPage(){const hash=location.hash.replace('#/','');return ['augmented','export-pdf','admin'].includes(hash)?hash:'main'}
export default function App(){const [page,setPage]=useState(currentPage);useEffect(()=>{const h=()=>setPage(currentPage());addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);const navigate=(p:string)=>{location.hash=p==='main'?'#/':`#/${p}`;setPage(p)};return <>{page==='augmented'?<AugmentedView navigate={navigate}/>:page==='export-pdf'?<ExportEditPDF navigate={navigate}/>:page==='admin'?<AdminView navigate={navigate}/>:<MainView navigate={navigate}/>}<Toast/></>}
