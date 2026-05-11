const API = 'http://localhost:5000/api';
const USER_ID = 99; 

async function loadPosts(sort = 'new') {
  const res = await fetch(`${API}/posts?sort=${sort}`);
  const posts = await res.json();

  document.getElementById('posts').innerHTML = posts.map(p => `
    <div class="post">
      <div class="vote-section">
        <button onclick="vote(${p.id}, 1)">⬆️</button>
        <span class="score">${p.score}</span>
        <button onclick="vote(${p.id}, -1)">⬇️</button>
      </div>
      <div class="post-content">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
      </div>
    </div>
  `).join('');
}

async function createPost() {
  const title   = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  await fetch(`${API}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });

  document.getElementById('title').value   = '';
  document.getElementById('content').value = '';
  loadPosts();
}

async function vote(post_id, value) {
  await fetch(`${API}/posts/${post_id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: USER_ID, value })
  });
  loadPosts();
}

loadPosts();