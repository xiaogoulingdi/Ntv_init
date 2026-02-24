//引入socket里的server类
const {Server} = require('socket.io');

//实例化服务器
const io = new Server(3000, {
    //cors跨域设置
    cors:{
        origin:'*', //允许所有来源
    }

})

let waitingQueue = []; //等待配对的用户队列


console.log('服务器已启动，监听3000端口');
//监听连接事件
io.on('connection', (socket)=>{
    console.log('新用户连接了，socket id:', socket.id);

    socket.on("find-match",()=>{
        console.log(`user${socket.id} waiting,current queue length:${waitingQueue.length}`);


        if(waitingQueue.length>0){
            //从队列头部取出一个等待用户
            const partenerSocket = waitingQueue.shift();
            if(partenerSocket.id ===socket.id){
                waitingQueue.push(socket);
                return;
            }
            //设置房间号
            const roomId = [socket.id,partenerSocket.id].sort().join('-');
            //加入房间
            socket.join(roomId);
            partenerSocket.join(roomId);
            //通知双方配对成功
            socket.emit("match-found",{partnerId:partenerSocket.id, initiator:true});
            partenerSocket.emit("match-found",{partnerId:socket.id, initiator:false});
            console.log('用户', socket.id, '和用户', partenerSocket.id, '配对成功，房间号:', roomId);
        }else {
            //没有等待用户，加入队列
            waitingQueue.push(socket);
            console.log(`user${socket.id} added to waiting queue`);
        }
    })

    //信令转发
    socket.on('signal',(data)=>{
        io.to(data.target).emit('signal',{
            sender:socket.id,
            signal:data.signal
        })

    })

    socket.on('disconnect',()=>{
        console.log('用户', socket.id, '断开连接');
        waitingQueue = waitingQueue.filter(user => user !== socket);
    })

})