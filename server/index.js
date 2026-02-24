//引入socket里的server类
const {Server} = require('socket.io');

//实例化服务器
const io = new Server(3000, {
    //cors跨域设置
    cors:{
        origin:'*', //允许所有来源
    }

})

console.log('服务器已启动，监听3000端口');
//监听连接事件
io.on('connection', (socket)=>{
    console.log('新用户连接了，socket id:', socket.id);
    socket.on('disconnect',()=>{
        console.log('用户断开连接了，socket id:', socket.id);   
    })
})