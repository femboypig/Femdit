const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const generateNickname = require('./randomNick');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(cookieParser());

let posts = [];

io.on('connection', (socket) => {
    let nickname;
    if (!socket.handshake.headers.cookie || !socket.handshake.headers.cookie.includes('nickname')) {
        nickname = generateNickname();
        socket.emit('setNickname', nickname);
    } else {
        nickname = decodeURIComponent(socket.handshake.headers.cookie.split('nickname=')[1].split(';')[0]);
    }

    socket.emit('loadPosts', posts);

    socket.on('newPost', (content) => {
        const newPost = { id: Date.now(), content, nickname, likes: [], dislikes: [], comments: [], createdAt: new Date() };
        posts.unshift(newPost);
        io.emit('newPost', newPost);
    });

    socket.on('likePost', (postId) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            if (post.likes.includes(nickname)) {
                post.likes = post.likes.filter(n => n !== nickname);
            } else {
                post.likes.push(nickname);
                post.dislikes = post.dislikes.filter(n => n !== nickname);
            }
            io.emit('updatePost', post);
        }
    });

    socket.on('dislikePost', (postId) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            if (post.dislikes.includes(nickname)) {
                post.dislikes = post.dislikes.filter(n => n !== nickname);
            } else {
                post.dislikes.push(nickname);
                post.likes = post.likes.filter(n => n !== nickname);
            }
            io.emit('updatePost', post);
        }
    });

    socket.on('newComment', (postId, content) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            const comment = { nickname, content, createdAt: new Date() };
            post.comments.push(comment);
            io.emit('updatePost', post);
        }
    });

    socket.on('removePost', (postId) => {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1 && posts[postIndex].nickname === nickname) {
            posts.splice(postIndex, 1);
            io.emit('removePost', postId);
        }
    });

    socket.on('removeComment', (postId, commentIndex) => {
        const post = posts.find(p => p.id === postId);
        if (post && post.comments[commentIndex] && post.comments[commentIndex].nickname === nickname) {
            post.comments.splice(commentIndex, 1);
            io.emit('updatePost', post);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
