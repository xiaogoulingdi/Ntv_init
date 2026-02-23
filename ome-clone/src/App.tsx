import { useState, useRef } from 'react';

function App() {
  const [isMatching, setIsMatching] = useState(false);

  // --- 引用 (Refs) ---
  // 这两个变量就像 C++ 里的指针，专门用来指向网页中的 <video> 标签。
  // <HTMLVideoElement | null> 是 TypeScript 语法，表示指针类型是视频元素，或者为空(nullptr)。
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleMatchClick = () => {
    setIsMatching(true);
    // 这里暂时用一个简单的定时器模拟匹配过程
    setTimeout(() => {
      setIsMatching(false);
      alert("匹配成功！(待接入 WebRTC)");
    }, 2000);
  };

  // --- 界面布局 (UI) ---
  return (
    // 最外层容器：铺满整个屏幕(100vh)，暗色背景，使用 Flexbox 垂直排列(column)
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      
      {/* 顶部标题 */}
      <h2 style={{ textAlign: 'center', margin: '15px 0' }}>Ome.tv Clone</h2>

      {/* 视频核心区域：Flex=1 意味着它会自动占据除了标题和底部栏之外的所有剩余空间 */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: '20px', padding: '20px' }}>
        
        {/* 左侧：我的画面 */}
        <div style={{ flex: 1, maxWidth: '600px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
           {/* 关键点：通过 ref={localVideoRef}，把我们的“指针”绑定到这个视频标签上。
             autoPlay 保证有视频流时自动播放。
             muted 是必须的！你不能听到自己麦克风的声音，否则会产生刺耳的回音。
           */}
           <video 
             ref={localVideoRef} 
             autoPlay 
             muted 
             style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
           />
           <span style={{ position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
             我
           </span>
        </div>

        {/* 右侧：对方画面 */}
        <div style={{ flex: 1, maxWidth: '600px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
           <video 
             ref={remoteVideoRef} 
             autoPlay 
             style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
           />
           <span style={{ position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
             陌生人
           </span>
        </div>

      </div>

      {/* 底部控制栏 */}
      <div style={{ height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a2a2a' }}>
        <button 
          onClick={handleMatchClick}
          disabled={isMatching}
          style={{ 
            padding: '15px 40px', fontSize: '18px', cursor: 'pointer', borderRadius: '30px', border: 'none', fontWeight: 'bold',
            backgroundColor: isMatching ? '#555' : '#4CAF50', // 匹配中变成灰色，平时是绿色
            color: 'white' 
          }}
        >
          {isMatching ? '🔍 寻找陌生人中...' : '▶ 开始匹配'}
        </button>
      </div>

    </div>
  );
}

export default App;