import GisMap from "../code/gisMap";
import * as Cesium from "@modules/cesium/Source/Cesium";
import React,{useState,useCallback} from 'react'
import {createRoot} from 'react-dom/client';
import "./index.less"
// window['CESIUM_BASE_URL'] = '/static/Cesium'
let gisMap = new GisMap('cesium');

window.gisMap = gisMap

const Content =()=>{

    const [name,setName]= useState('测试')
    const [latitude,setLatitude]= useState(30.644)
    const [longitude,setLongitude]= useState(104)
    const [altitude,setAltitude]= useState(100)
    const [labelName,setLabelName]= useState('测试点')
    const [tip,setTip]= useState('')

    const setView=useCallback(()=>{
        gisMap.cSetView({longitude:Number(longitude),latitude:Number(latitude),altitude:Number(altitude)})
    },[latitude,longitude,altitude])
    const drawAnimateLine = ()=>{
        const start = {latitude:Number(latitude),longitude:Number(longitude),altitude:Number(altitude)}
        const ends =[[116.20,39.56,0]]
        // const ends = [[110,20,0],[100,10],[90,0,0],[70,20,0],[50,10,0]]
        ends.forEach(i=>{
            gisMap.drawAnimateLine(start,{longitude:i[0],latitude:i[1],altitude:i[2]},{color:'#33FF66'})
        })

    }
    const drawLine = ()=>{
        const start = {latitude:Number(latitude),longitude:Number(longitude),altitude:Number(altitude)}
        const ends = [[116.20,39.56,0]]

        ends.forEach(i=>{
            gisMap.drawLine(start,{longitude:i[0],latitude:i[1],altitude:i[2]},{color:'#66FFFF'})
        })
    }

    const test = ()=>{
        gisMap.test()
    }
    return (<div className="box">
        <div>
            <div>
                <span>标签</span><input value={name} onChange={(e)=>setName(e.target.value)}/> 
            </div>
            <div>
                <span>经度</span><input type="number" value={longitude} onChange={(e)=>setLongitude(e.target.value)}/> 
            </div>
            <div>
                <span>纬度</span><input type="number" value={latitude} onChange={(e)=>{setLatitude(e.target.value)}}/> 
            </div>
            <div>
                <span>高度</span><input type="number" value={altitude} onChange={(e)=>setAltitude(e.target.value)}/> 
            </div>
            <div>
                <span>labelName</span><input value={labelName} onChange={(e)=>setLabelName(e.target.value)}/> 
            </div>
            <div>
                <span>tip</span><input value={tip} onChange={(e)=>setTip(e.target.value)}/> 
            </div>
            
        </div>
        <div className="btn" onClick={setView}>设置显示</div>    
        <div  className="btn" onClick={drawLine}>线段绘制</div>
        <div className="btn" onClick={drawAnimateLine}>动态线绘制</div>      
        {/* <div className="btn" onClick={test}>管道</div>       */}
    
    </div>)

}

// 3.渲染react元素
const root = createRoot( document.getElementById('app'))
root.render(<Content />)