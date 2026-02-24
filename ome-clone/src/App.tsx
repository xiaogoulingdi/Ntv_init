import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [isMatching, setIsMatching] = useState(false);

  // --- 引用 (Refs) ---
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleMatchClick = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      alert("匹配成功！(待接入 WebRTC)");
    }, 2000);
  };

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