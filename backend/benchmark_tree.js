const { performance } = require('perf_hooks');
const { buildCommentTree, traverseCommentsDFS } = require('./utils/treeUtils');

// Hàm tạo dữ liệu giả lập (mock data)
function generateMockComments(size) {
    const comments = [];
    for (let i = 1; i <= size; i++) {
        comments.push({
            id: i,
            post_id: 1,
            user_id: 1,
            // 1 gốc đầu tiên, còn lại bám vào gốc hoặc bám vào phần tử trước đó để tạo độ sâu
            parent_comment_id: i === 1 ? null : Math.max(1, i - Math.floor(Math.random() * 10)),
            content: `Day la comment test thu ${i}`,
            vote_count: Math.floor(Math.random() * 100),
            created_at: new Date()
        });
    }
    return comments;
}

// Bảng kết quả
const results = [];

const sizes = [1000, 5000, 10000];

console.log('Đang chạy quá trình Benchmark Thuật toán (Build Tree & DFS)... \n');

sizes.forEach(size => {
    // 1. Tạo dữ liệu phẳng
    const flatComments = generateMockComments(size);

    // 2. Đo thời gian Build Tree
    const startBuild = performance.now();
    const tree = buildCommentTree(flatComments);
    const endBuild = performance.now();
    const buildTime = (endBuild - startBuild).toFixed(3);

    // 3. Đo thời gian DFS duyệt cây
    let nodeCount = 0;
    const startDFS = performance.now();
    traverseCommentsDFS(tree, (node) => {
        nodeCount++;
    });
    const endDFS = performance.now();
    const dfsTime = (endDFS - startDFS).toFixed(3);

    // Lưu kết quả
    results.push({
        'Số lượng comments': size,
        'Thời gian Build (ms)': buildTime,
        'Thời gian DFS (ms)': dfsTime,
        'Số node đã duyệt': nodeCount,
        'Root Nodes': tree.length
    });
});

console.table(results);
console.log('\nBạn hãy chụp lại màn hình Terminal này để đưa vào báo cáo nhé!');
