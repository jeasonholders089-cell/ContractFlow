// 分隔条拖拽诊断代码 - 在浏览器控制台运行

console.log('=== 开始分隔条诊断 ===');

// 1. 检查元素是否存在
const resizer = document.getElementById('resizer');
const previewPanel = document.getElementById('preview-panel');
const editorPanel = document.getElementById('editor-panel');

console.log('1. 元素检查:');
console.log('  - resizer:', resizer);
console.log('  - previewPanel:', previewPanel);
console.log('  - editorPanel:', editorPanel);

if (!resizer) {
    console.error('❌ 找不到 resizer 元素！分隔条不存在！');
} else {
    // 2. 检查样式
    const styles = getComputedStyle(resizer);
    console.log('2. 分隔条样式:');
    console.log('  - display:', styles.display);
    console.log('  - cursor:', styles.cursor);
    console.log('  - pointerEvents:', styles.pointerEvents);
    console.log('  - zIndex:', styles.zIndex);
    console.log('  - position:', styles.position);
    console.log('  - width:', styles.width);
    console.log('  - height:', styles.height);
    console.log('  - visibility:', styles.visibility);

    // 3. 检查位置
    const rect = resizer.getBoundingClientRect();
    console.log('3. 分隔条位置:');
    console.log('  - top:', rect.top);
    console.log('  - left:', rect.left);
    console.log('  - width:', rect.width);
    console.log('  - height:', rect.height);
    console.log('  - 是否在视口内:', rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth);

    // 4. 检查是否被其他元素遮挡
    console.log('4. 检查元素是否被遮挡:');
    const elementAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    console.log('  - 分隔条中心的元素:', elementAtCenter);
    console.log('  - 是否是分隔条本身:', elementAtCenter === resizer);

    if (elementAtCenter !== resizer) {
        console.warn('⚠️ 分隔条被其他元素遮挡！遮挡元素:', elementAtCenter);
    }

    // 5. 检查事件监听器
    console.log('5. 检查事件监听器:');
    if (typeof getEventListeners === 'function') {
        const listeners = getEventListeners(resizer);
        console.log('  - 事件监听器:', listeners);
        if (!listeners || !listeners.mousedown) {
            console.warn('⚠️ 没有找到 mousedown 事件监听器！');
        }
    } else {
        console.log('  - getEventListeners 不可用（Chrome only）');
    }

    // 6. 测试点击
    console.log('6. 添加点击测试:');
    resizer.addEventListener('click', function(e) {
        console.log('✅ 分隔条被点击了！事件绑定正常。', e);
        alert('✅ 分隔条可以接收点击事件！');
    }, { once: true });
    console.log('  - 请点击分隔条测试...');
}

// 7. 检查 preview-panel 状态
if (previewPanel) {
    const previewStyles = getComputedStyle(previewPanel);
    console.log('7. 预览面板状态:');
    console.log('  - width:', previewStyles.width);
    console.log('  - display:', previewStyles.display);
    console.log('  - class:', previewPanel.className);
}

// 8. 尝试重新初始化
console.log('8. 尝试重新初始化拖拽功能:');
try {
    if (typeof initResizer === 'function') {
        console.log('  - initResizer 函数存在');
        // initResizer(); // 取消注释以重新初始化
        console.log('  - 如需重新初始化，请运行: initResizer()');
    } else {
        console.error('❌ initResizer 函数不存在！脚本可能未正确加载。');
    }
} catch (e) {
    console.error('❌ 重新初始化失败:', e);
}

console.log('=== 诊断完成 ===');
console.log('');
console.log('💡 如果分隔条被遮挡，可能需要调整 z-index');
console.log('💡 如果没有事件监听器，请刷新页面重新加载');
