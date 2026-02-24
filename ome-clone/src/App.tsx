import {io} from 'socket.io-client';
import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isMatching, setIsMatching] = useState(false);

  // --- 引用 (Refs) ---
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  //链接信令服务器
  useEffect(()=>{
    // 连接到信令服务器
    const socket = io('http://localhost:3000');
    // 监听连接成功事件
    socket.on('connect',()=>{
      console.log('Connected to signaling server');
    })
    return()=>{
      socket.disconnect();
    }

  },[])
  const handleMatchClick = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      alert("匹配成功！(待接入 WebRTC)");
    }, 2000);
  };

//获取本地视频流
useEffect(()=>{
  const startLocalVideo = async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
      if(localVideoRef.current){
        localVideoRef.current.srcObject = stream;
      }
    } catch(error){
      console.error('Error accessing media devices.',error);
      alert('无法访问摄像头和麦克风，请检查权限设置。');
    }
  }
  startLocalVideo();
},[])


  // --- 界面布局 (UI) ---
  return (
    <div className="app">

      {/* 顶部标题 */}
      <div className="header">
        Next<span>TV</span>
      </div>

      {/* 视频核心区域 */}
      <div className="video-area">

        {/* 左侧：我的画面 */}
        <div className="video-box">
          <video ref={localVideoRef} autoPlay muted />
          <span className="video-label">我</span>
        </div>

        {/* 右侧：对方画面 */}
        <div className="video-box">
          <video ref={remoteVideoRef} autoPlay />
          <span className="video-label">陌生人</span>
        </div>

      </div>

      {/* 底部控制栏 */}
      <div className="controls">
        <button
          className="match-btn"
          onClick={handleMatchClick}
          disabled={isMatching}
        >
          {isMatching ? '寻找陌生人中...' : '开始匹配'}
        </button>
      </div>

    </div>
  );
}

export default App;