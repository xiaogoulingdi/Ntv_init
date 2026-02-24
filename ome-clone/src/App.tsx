import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

// WebRTC 配置：使用 Google 的公共 STUN 服务器
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' } 
  ]
};

function App() {
  const [isMatching, setIsMatching] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // --- 保存 WebRTC 连接对象 ---
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // --- 核心函数：创建 WebRTC 连接 ---
  const createPeerConnection = (partnerId: string) => {
    // 1. 实例化 PeerConnection
    const pc = new RTCPeerConnection(rtcConfig);

    // 2. 只有当对方的视频流传过来时，这个事件才会触发
    pc.ontrack = (event) => {
      console.log("🎥 收到对方的视频流！");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 3. 收集到自己的 "家庭住址" (ICE Candidate) 时，发给对方
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('signal', {
          target: partnerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // 4. 把我们的本地视频流 "塞" 进这个连接里，准备发给对方
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  // --- 连接信令服务器 ---
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
    });

    // --- 监听匹配成功 ---
    socketRef.current.on('match-found', async ({ partnerId, initiator }) => {
      console.log(`🎉 匹配成功！对手: ${partnerId}, 我是发起者吗? ${initiator}`);
      setIsMatching(false);

      // 1. 创建连接对象
      const pc = createPeerConnection(partnerId);

      // 2. 如果我是发起者，我负责创建 "Offer" (提议)
      if (initiator) {
        try {
          // 生成 SDP (包含我的编码参数等信息)
          const offer = await pc.createOffer();
          // 告诉本地连接：这是我的配置
          await pc.setLocalDescription(offer);
          
          // 发送给对方 (通过信令服务器转发)
          socketRef.current?.emit('signal', {
            target: partnerId,
            signal: { type: 'offer', sdp: offer }
          });
          console.log("📨 已发送 Offer");
        } catch (err) {
          console.error("创建 Offer 失败:", err);
        }
      }
    });

    // --- 监听对方发来的信号 (Offer / Answer / Candidate) ---
    socketRef.current.on('signal', async ({ sender, signal }) => {
      const pc = peerConnectionRef.current;
      
      // 如果还没创建连接，先创建
      if (!pc) {
        return; 
      }

      if (signal.type === 'offer') {
        // A. 收到对方的 Offer
        console.log("📨 收到 Offer, 准备回复 Answer");
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socketRef.current?.emit('signal', {
          target: sender,
          signal: { type: 'answer', sdp: answer }
        });

      } else if (signal.type === 'answer') {
        // B. 收到对方回复的 Answer
        console.log("📨 收到 Answer, 握手完成！");
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

      } else if (signal.type === 'candidate') {
        // C. 收到对方的地址候选 (ICE Candidate)
        console.log("🧊 收到 ICE Candidate");
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    return () => {
      socketRef.current?.disconnect();
      // 记得清理 WebRTC 连接
      peerConnectionRef.current?.close();
    };
  }, []);

  // --- 点击匹配按钮 ---
  const handleMatchClick = () => {
    setIsMatching(true);
    // 向后端发送匹配请求
    socketRef.current?.emit('find-match');
  };

  // --- 获取本地视频流 ---
  useEffect(() => {
    const startLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream; // 保存本地视频流
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
        alert('无法访问摄像头和麦克风，请检查权限设置。');
      }
    };
    startLocalVideo();
    
    // 组件卸载时停止视频流
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


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