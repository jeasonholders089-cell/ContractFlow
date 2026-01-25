// 快速诊断代码 - 在浏览器控制台运行

// 1. 检查分隔条
const r = document.getElementById('resizer');
if (!r) {
    alert('❌ 找不到分隔条！');
} else {
    const s = getComputedStyle(r);
    console.log('分隔条状态:', {
        display: s.display,
        cursor: s.cursor,
        pointerEvents: s.pointerEvents,
        zIndex: s.zIndex,
        width: s.width,
        height: s.height,
        position: s.position
    });

    // 检查是否被遮挡
    const rect = r.getBoundingClientRect();
    const el = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    if (el === r) {
        console.log('✅ 分隔条未被遮挡');
    } else {
        console.warn('⚠️ 分隔条被以下元素遮挡:', el);
    }

    // 添加点击测试
    r.addEventListener('click', () => alert('✅ 分隔条可以接收点击！'), { once: true });
    alert('已添加点击测试，请点击分隔条');
}
