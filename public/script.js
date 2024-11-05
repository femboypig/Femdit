const socket = io();

// Загрузка существующих постов при подключении
socket.on('loadPosts', (posts) => {
    posts.forEach(addPostToPage);
});

socket.on('setNickname', (nickname) => {
    document.cookie = `nickname=${encodeURIComponent(nickname)}`;
    document.getElementById('nickname').innerText = `Ваш ник: ${nickname}`;
});

socket.on('newPost', (post) => {
    addPostToPage(post);
});

socket.on('updatePost', (updatedPost) => {
    updatePostOnPage(updatedPost);
});

socket.on('removePost', (postId) => {
    document.getElementById(`post-${postId}`).remove();
});

function addPost() {
    const content = document.getElementById('postContent').value;
    if (content.trim() !== "") {
        socket.emit('newPost', content);
        document.getElementById('postContent').value = '';
    }
}

function addComment(postId) {
    const input = document.querySelector(`#comment-input-${postId} input`);
    const content = input.value;
    if (content.trim() !== "") {
        socket.emit('newComment', postId, content);
        input.value = '';
    }
}

function likePost(postId) {
    socket.emit('likePost', postId);
}

function dislikePost(postId) {
    socket.emit('dislikePost', postId);
}

function removePost(postId) {
    socket.emit('removePost', postId);
}

function removeComment(postId, commentIndex) {
    socket.emit('removeComment', postId, commentIndex);
}

function addPostToPage(post) {
    const postsDiv = document.getElementById('posts');
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.id = `post-${post.id}`;

    // Проверка на владельца поста для отображения кнопки удаления
    const canDeletePost = document.cookie.includes(`nickname=${encodeURIComponent(post.nickname)}`);
    
    postDiv.innerHTML = `
        <p class="author">${post.nickname}</p>
        <p class="content">${post.content}</p>
        ${canDeletePost ? `<button onclick="removePost(${post.id})" class="delete-button">🗑️</button>` : ''}
        <div class="like-dislike-buttons">
            <button onclick="likePost(${post.id})" class="like-button">👍 ${post.likes.length}</button>
            <button onclick="dislikePost(${post.id})" class="dislike-button">👎 ${post.dislikes.length}</button>
        </div>
        <div class="comment-section" id="comments-${post.id}">
            ${post.comments.map((comment, index) => {
                const canDeleteComment = document.cookie.includes(`nickname=${encodeURIComponent(comment.nickname)}`);
                return `
                    <div class="comment">
                        <p><strong>${comment.nickname}</strong>: ${comment.content}</p>
                        ${canDeleteComment ? `<button onclick="removeComment(${post.id}, ${index})" class="delete-button-small">🗑️</button>` : ''}
                    </div>
                `;
            }).join('')}
            <div class="comment-input" id="comment-input-${post.id}">
                <input type="text" placeholder="Добавьте комментарий..." />
                <button onclick="addComment(${post.id})">Отправить</button>
            </div>
        </div>
    `;
    postsDiv.prepend(postDiv);
}


function updatePostOnPage(post) {
    const postDiv = document.getElementById(`post-${post.id}`);
    postDiv.querySelector('.like-button').innerText = `👍 ${post.likes.length}`;
    postDiv.querySelector('.dislike-button').innerText = `👎 ${post.dislikes.length}`;

    const commentsDiv = postDiv.querySelector(`#comments-${post.id}`);
    const canDeletePost = document.cookie.includes(`nickname=${encodeURIComponent(post.nickname)}`);
    
    commentsDiv.innerHTML = `
        ${post.comments.map((comment, index) => {
            const canDeleteComment = document.cookie.includes(`nickname=${encodeURIComponent(comment.nickname)}`);
            return `
                <div class="comment">
                    <p><strong>${comment.nickname}</strong>: ${comment.content}</p>
                    ${canDeleteComment ? `<button onclick="removeComment(${post.id}, ${index})" class="delete-button-small">🗑️</button>` : ''}
                </div>
            `;
        }).join('')}
        <div class="comment-input" id="comment-input-${post.id}">
            <input type="text" placeholder="Добавьте комментарий..." />
            <button onclick="addComment(${post.id})">Отправить</button>
        </div>
    `;
    
    // Обновляем кнопку удаления для поста, если пост принадлежит текущему пользователю
    if (canDeletePost && !postDiv.querySelector('.delete-button')) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerText = '🗑️';
        deleteButton.onclick = () => removePost(post.id);
        postDiv.insertBefore(deleteButton, postDiv.querySelector('.like-dislike-buttons'));
    }
}
document.addEventListener('DOMContentLoaded', loadPosts);