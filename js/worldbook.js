// js/worldbook.js
import { switchPage } from './router.js';
import { startNewEntry, startEditEntry } from './worldbook_edit.js';

// --- 数据存储 ---
let wbEntries = [];
let wbCategories = []; // 存放分类列表
let currentCatId = 'global'; 

// 读取条目
const savedEntries = localStorage.getItem('wb_entries');
if (savedEntries) {
    try { wbEntries = JSON.parse(savedEntries); } catch (e) { wbEntries = []; }
}

// 读取分类 (如果没有，默认给一个“全局”)
const savedCats = localStorage.getItem('wb_categories');
if (savedCats) {
    try { wbCategories = JSON.parse(savedCats); } catch (e) { wbCategories = []; }
} else {
    wbCategories = [{ id: 'global', name: '全局' }];
}

// --- 保存函数 ---
function saveData() {
    localStorage.setItem('wb_entries', JSON.stringify(wbEntries));
    localStorage.setItem('wb_categories', JSON.stringify(wbCategories));
    renderCategories(); // 数据变了，刷新分类列表
}

// --- 初始化 ---
export function initWorldbook() {
    renderCategories();     // 渲染分类列表
    setupEntryListButtons(); // 绑定列表页按钮
    setupModal();           // 绑定弹窗事件
}

// --- 1. 分类列表逻辑 ---
function renderCategories() {
    const listContainer = document.getElementById('worldbook-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // 渲染“新增分类”按钮 (那个虚线框)
    const addBtn = document.createElement('div');
    addBtn.className = 'wb-add-category';
    addBtn.textContent = '+ 新增分类';
    addBtn.addEventListener('click', () => {
        showModal(); // 点击显示弹窗
    });
    // 注意：如果你之前的 HTML 里有写死的按钮，可以删掉，或者在这里统一管理
    // 这里我们把按钮放在列表的最前面或者最后面都可以
    // 既然 index.html 里有一个 .wb-add-category，我们直接给它绑事件就行，不用 JS 创建
    // 下面只渲染卡片
    
    // 遍历分类数组
    wbCategories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'wb-category-card';
        
        // 只数属于当前这个分类(cat.id)的条目
const count = wbEntries.filter(e => (e.categoryId || 'global') === cat.id).length;


        card.innerHTML = `
            <div class="wb-title">${cat.name}</div>
            <div class="wb-count">${count} 条目</div>
        `;
        card.addEventListener('click', () => {
            openEntryList(cat.id, cat.name); // 把 ID 也传进去
        });
        listContainer.appendChild(card);
    });

    // 重新绑定一下页面上那个静态的“新增分类”按钮
    const staticAddBtn = document.getElementById('btn-add-wb-category');
    if (staticAddBtn) {
        // 先移除旧的监听器防止重复(简单粗暴的方法是克隆节点，或者保证 init 只执行一次)
        // 这里假设 init 只执行一次
        staticAddBtn.onclick = () => showModal();
    }
}

// --- 2. 弹窗逻辑 ---
function setupModal() {
    const modal = document.getElementById('modal-new-category');
    const btnCancel = document.getElementById('btn-cancel-cat');
    const btnConfirm = document.getElementById('btn-confirm-cat');
    const input = document.getElementById('input-cat-name');

    if (!modal) return;

    // 取消
    btnCancel.onclick = () => {
        modal.classList.add('hidden');
    };

    // 确定
    btnConfirm.onclick = () => {
        const name = input.value.trim();
        if (!name) {
            alert('宝宝，起个名字嘛~');
            return;
        }
        
        // 添加新分类
        wbCategories.push({
            id: Date.now().toString(),
            name: name
        });
        
        saveData(); // 保存并刷新
        
        input.value = ''; // 清空输入框
        modal.classList.add('hidden'); // 关闭弹窗
    };
    
    // 点击遮罩层关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function showModal() {
    const modal = document.getElementById('modal-new-category');
    const input = document.getElementById('input-cat-name');
    if (modal) {
        modal.classList.remove('hidden');
        if(input) input.focus(); // 自动聚焦输入框
    }
}

// --- 3. 条目列表逻辑 (保持不变，稍微整理) ---
// 接收两个参数：id 和 name
function openEntryList(id, name) {
    currentCatId = id; // 记住当前ID
    const titleEl = document.getElementById('wb-category-title');
    if (titleEl) titleEl.textContent = name; // 标题还是显示名字
    renderEntries();
    switchPage('page-worldbook-entries');
}

function renderEntries() {
    const container = document.getElementById('wb-entries-list');
    if (!container) return;
    container.innerHTML = ''; 

wbEntries.forEach((entry, index) => {
    // --- 加上这句 ---
    // 如果条目的分类ID 不等于 当前分类ID，就跳过不显示
    // (entry.categoryId || 'global') 的意思是：如果是老数据没标签，就默认算在 global 里
    if ((entry.categoryId || 'global') !== currentCatId) return; 
    // ----------------
    
    const item = document.createElement('div');
        item.className = 'wb-entry-item';
        
        let dotClass = 'dot-blue';
        if (entry.status === 'green') dotClass = 'dot-green';
        if (entry.status === 'red') dotClass = 'dot-red';

        item.innerHTML = `
            <label class="wb-switch">
                <input type="checkbox" ${entry.enabled ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
            <div class="wb-status-dot ${dotClass}"></div>
            <div class="wb-entry-title">${entry.title || '无标题'}</div>
            <div class="wb-btn-delete">×</div>
        `;

        const checkbox = item.querySelector('input');
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        checkbox.addEventListener('change', (e) => {
            entry.enabled = e.target.checked;
            saveData();
        });

        const btnDel = item.querySelector('.wb-btn-delete');
        btnDel.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if(confirm('宝宝，确定要删除这个条目吗？')) {
                wbEntries.splice(index, 1);
                saveData();
                renderEntries();
            }
        });

        item.addEventListener('click', () => {
            startEditEntry(entry);
        });

        container.appendChild(item);
    });
}

function setupEntryListButtons() {
    const btnBack = document.getElementById('btn-back-wb-entries');
    if (btnBack) {
        btnBack.addEventListener('click', () => switchPage('page-worldbook'));
    }
    const btnNew = document.getElementById('btn-new-wb-entry');
    if (btnNew) {
        btnNew.addEventListener('click', () => startNewEntry());
    }
}

// --- 外部接口 ---
export function addEntry(data) {
    // 存的时候带上 categoryId
    wbEntries.push({ 
        id: Date.now(), 
        categoryId: currentCatId, // <--- 加上这句，标记它属于谁
        enabled: true, 
        ...data 
    });
    saveData();
    renderEntries(); 
}

export function updateEntry(id, newData) {
    const index = wbEntries.findIndex(e => e.id === id);
    if (index !== -1) {
        wbEntries[index] = { ...wbEntries[index], ...newData };
        saveData();
        renderEntries();
    }
}
