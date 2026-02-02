// js/worldbook_edit.js
import { switchPage } from './router.js';
import { addEntry, updateEntry } from './worldbook.js'; // 引入 updateEntry

let currentEditingId = null; // 用来记录当前正在编辑的 ID，如果是 null 代表是新建

export function initWorldbookEdit() {
    setupStrategyToggle();
    setupWordCounter();
    setupButtons();
}

// --- 新增：供外部调用的两个函数 ---

// 1. 开始新建 (清空表单)
export function startNewEntry() {
    currentEditingId = null; // 标记为新建
    clearForm();
    switchPage('page-worldbook-edit');
}

// 2. 开始编辑 (填充表单)
export function startEditEntry(entry) {
    currentEditingId = entry.id; // 记录 ID
    
    // 填充表单数据
    document.getElementById('wb-title').value = entry.title || '';
    document.getElementById('wb-status').value = entry.status || 'blue';
    document.getElementById('wb-keys').value = entry.keys || '';
    document.getElementById('wb-content').value = entry.content || '';
    
    // 触发一下字数统计
    document.getElementById('wb-content').dispatchEvent(new Event('input'));

    switchPage('page-worldbook-edit');
}

// --- 内部逻辑 ---

function clearForm() {
    document.getElementById('wb-title').value = '';
    document.getElementById('wb-status').value = 'blue';
    document.getElementById('wb-keys').value = '';
    document.getElementById('wb-content').value = '';
    document.getElementById('wb-content-count').textContent = '词符: 0';
}

function setupStrategyToggle() {
    const strategySelect = document.getElementById('wb-strategy');
    const depthGroup = document.getElementById('group-wb-depth');
    if (strategySelect && depthGroup) {
        strategySelect.addEventListener('change', () => {
            if (strategySelect.value === 'depth') {
                depthGroup.classList.remove('hidden');
            } else {
                depthGroup.classList.add('hidden');
            }
        });
    }
}

function setupWordCounter() {
    const textarea = document.getElementById('wb-content');
    const counter = document.getElementById('wb-content-count');
    if (textarea && counter) {
        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            counter.textContent = `词符: ${len}`;
        });
    }
}

function setupButtons() {
    // 返回按钮
    const btnBack = document.getElementById('btn-back-wb-edit');
    if (btnBack) {
        btnBack.onclick = () => {
            switchPage('page-worldbook-entries');
        };
    }

    // 保存按钮
    const btnSave = document.getElementById('btn-save-wb-entry');
    if (btnSave) {
        btnSave.onclick = () => {
            const title = document.getElementById('wb-title').value;
            const status = document.getElementById('wb-status').value;
            const keys = document.getElementById('wb-keys').value;
            const content = document.getElementById('wb-content').value;
            
            if (!title) {
                alert('宝宝，标题还没写呢~');
                return;
            }

            const entryData = {
                title: title,
                status: status,
                keys: keys,
                content: content
            };

            if (currentEditingId) {
                // 如果有 ID，说明是修改
                updateEntry(currentEditingId, entryData);
            } else {
                // 没有 ID，说明是新建
                addEntry(entryData);
            }

            switchPage('page-worldbook-entries');
        };
    }
}
