/**
* TagSelect 类 - 多选标签下拉组件
* @param {string|HTMLElement} container - 容器的选择器或DOM元素
* @param {Object} options - 配置项
*/
class TagSelect {
    constructor(container, options = {}) {
        // 1. 初始化容器
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!this.container) {
            throw new Error('TagSelect: 容器元素未找到');
        }

        // 2. 默认配置
        this.config = {
            placeholder: '请输入或选择版本',
            allowCreate: true, // 是否允许手动输入创建新标签
            ...options
        };

        // 在 constructor 中找到 this.config 初始化的地方，在下面添加
        this._disabled = false; // 添加禁用状态标记

        // 3. 核心数据
        this._items = [];     // 所有可选数据源
        this._selected = [];  // 已选中的值
        this._callbacks = {
            change: null,
            select: null,
            remove: null
        };

        // 4. 构建 DOM 结构
        this._initDOM();
        
        // 5. 绑定事件
        this._bindEvents();

        // 6. 初始化渲染
        this._renderDropdown();
        this._renderTags();

        console.log('TagSelect 组件已初始化');
    }

    // ==================== 内部方法 ====================

    /**
    * 初始化 DOM 结构
    */
    _initDOM() {
        // 清空容器
        this.container.innerHTML = '';
        this.container.className = 'tag-select-wrapper';

        // 创建输入框区域
        this.inputBox = document.createElement('div');
        this.inputBox.className = 'tag-input-box';
        this.container.appendChild(this.inputBox);

        // 创建实际输入框
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'tag-input';
        this.input.placeholder = this.config.placeholder;
        this.input.style.display = ''; // 确保默认显示
        this.inputBox.appendChild(this.input);

        // 创建下拉列表容器
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'dropdown-list';
        this.container.appendChild(this.dropdown);

        // 创建下拉列表容器
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'dropdown-list';
        // 这里不需要添加 'show' 类，默认就是隐藏的
        // 注意：CSS 中 .dropdown-list 默认 display: none
        this.container.appendChild(this.dropdown);
    }

    /**
    * 禁用组件
    */
    disable() {
        this._disabled = true;
        this.input.disabled = true;
        this.inputBox.style.cursor = 'not-allowed';
        this.inputBox.style.backgroundColor = '#f5f7fa';
        this.inputBox.style.borderColor = '#e4e7ed';
        this.dropdown.classList.remove('show');
        this.container.classList.add('disabled');
        
        // 隐藏输入框
        this.input.style.display = 'none';
        // 禁用时清除占位符
        this.input.placeholder = '';
        // 重新渲染标签（不显示删除按钮）
        this._renderTags();
        return this;
    }

    /**
    * 启用组件
    */
    enable() {
        this._disabled = false;
        this.input.disabled = false;
        this.inputBox.style.cursor = 'text';
        this.inputBox.style.backgroundColor = '#fff';
        this.inputBox.style.borderColor = '#d9d9d9';
        this.container.classList.remove('disabled');
        
        // 显示输入框
        this.input.style.display = '';
        // 恢复占位符
        this.input.placeholder = this.config.placeholder;
        // 重新渲染标签（显示删除按钮）
        this._renderTags();
        return this;
    }

    /**
    * 检查是否禁用
    * @returns {boolean}
    */
    isDisabled() {
        return this._disabled;
    }

    /**
    * 绑定事件处理
    */
    _bindEvents() {
            // 1. 输入框聚焦 -> 显示下拉
        this.input.addEventListener('focus', () => {
            if (this._disabled) {
                // 禁用状态下移除占位符
                this.input.placeholder = '';
                return;
            }
            this._renderDropdown(this.input.value);
        });

        // 2. 输入框输入 -> 过滤下拉
        this.input.addEventListener('input', () => {
            if (this._disabled) {
                return;
            }
            this._renderDropdown(this.input.value);
        });

        // 3. 输入框键盘事件 (回车添加 / 退格删除)
        this.input.addEventListener('keydown', (e) => {
            if (this._disabled) {
                return;
            }
            if (e.key === 'Enter' && this.input.value.trim() !== '') {
                e.preventDefault();
                this._handleAddTag(this.input.value.trim());
            }
            if (e.key === 'Backspace' && this.input.value === '' && this._selected.length > 0) {
                this._handleRemoveTag(this._selected[this._selected.length - 1]);
            }
        });

        // 4. 点击外部 -> 关闭下拉 (不受禁用影响，保持行为一致)
        // 4. 点击外部 -> 关闭下拉
        document.addEventListener('click', (e) => {
            // 判断点击是否在组件外部
            if (!this.container.contains(e.target)) {
                this.dropdown.classList.remove('show');
            } else {
                // 如果点击的是组件内部，但不是在输入框上，也要关闭下拉（可选）
                // 例如点击标签区域时关闭下拉
                if (e.target !== this.input && !this.inputBox.contains(e.target)) {
                    this.dropdown.classList.remove('show');
                }
            }
        });

            // 5. 点击输入框时，如果下拉已打开，再次点击不关闭（保持打开）
        this.input.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发 document 的点击事件
            if (this._disabled) return;
            // 如果下拉未显示，则显示
            if (!this.dropdown.classList.contains('show')) {
                this._renderDropdown(this.input.value);
            }
        });
    }

    /**
    * 渲染下拉列表
    * @param {string} filterText - 过滤文本
    */
    _renderDropdown(filterText = '') {
        // 过滤：排除已选中的，且匹配输入文字
        let filtered = this._items.filter(item => 
            !this._selected.includes(item) && 
            item.toLowerCase().includes(filterText.toLowerCase())
        );

        let html = '';
        let hasContent = false;

        // 如果允许创建，且输入文本不在选项中且未选中
        if (this.config.allowCreate && filterText && 
            !this._items.includes(filterText) && 
            !this._selected.includes(filterText)) {
            html += `<div class="dropdown-item create-item" data-value="${filterText}">创建 "${filterText}"</div>`;
            hasContent = true;
        }

        filtered.forEach(item => {
            html += `<div class="dropdown-item" data-value="${item}">${item}</div>`;
            hasContent = true;
        });

        // 修改这里：只有输入框有内容时才显示"无匹配选项"
        if (html === '' && filterText !== '') {
            html = `<div class="dropdown-item disabled">无匹配选项</div>`;
            hasContent = true;
        } else if (html === '' && filterText === '') {
            // 输入框为空且没有选项时，不显示任何内容
            html = '';
            hasContent = false;
        }

        this.dropdown.innerHTML = html;

        // 只有在有内容且输入框有焦点时才显示下拉
        if (hasContent && (document.activeElement === this.input || filterText !== '')) {
            this.dropdown.classList.add('show');
        } else {
            this.dropdown.classList.remove('show');
        }

        // 为所有下拉项绑定点击事件 (事件委托)
        this.dropdown.querySelectorAll('.dropdown-item:not(.disabled)').forEach(el => {
            el.addEventListener('click', (e) => {
                if (this._disabled) return;
                const value = el.dataset.value;
                if (value) {
                    this._handleAddTag(value);
                }
            });
        });
    }

    /**
    * 处理添加标签逻辑
    */
    _handleAddTag(value) {
        if (!value || this._selected.includes(value)) return;

        // 如果是新创建的标签，需要添加到数据源中（可选）
        if (!this._items.includes(value) && this.config.allowCreate) {
            this._items.push(value); 
            // 同时触发 items 更新的回调（如果有的话）
        }

        this._selected.push(value);
        this._renderTags();
        this.input.value = '';
        this.dropdown.classList.remove('show');
        this.input.focus();

        // 触发 onChange 回调
        this._triggerCallback('change', this._selected);
        this._triggerCallback('select', value);
    }

    /**
    * 处理删除标签逻辑
    */
    _handleRemoveTag(value) {
        const index = this._selected.indexOf(value);
        if (index === -1) return;

        this._selected.splice(index, 1);
        this._renderTags();
        this.input.focus();
        if (this.input.value) this._renderDropdown(this.input.value);

        // 触发 onChange 回调
        this._triggerCallback('change', this._selected);
        this._triggerCallback('remove', value);
    }

    /**
    * 渲染已选标签卡片
    */
    _renderTags() {
        // 移除旧的标签卡片 (保留 input)
        const oldTags = this.inputBox.querySelectorAll('.tag-item');
        oldTags.forEach(el => el.remove());

        // 插入新的标签卡片
        this._selected.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'tag-item';
            
            if (this._disabled) {
                // 禁用状态下不显示删除按钮
                div.textContent = tag;
            } else {
                // 正常状态下显示删除按钮
                div.innerHTML = `${tag} <span class="close-btn">×</span>`;
                
                // 绑定删除按钮事件
                div.querySelector('.close-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleRemoveTag(tag);
                });
            }

            this.inputBox.insertBefore(div, this.input);
        });

        // 根据禁用状态设置输入框显示
        if (this._disabled) {
            this.input.style.display = 'none';
            this.input.placeholder = '';
        } else {
            this.input.style.display = '';
            this.input.placeholder = this.config.placeholder;
        }
    }

    /**
    * 触发回调函数
    */
    _triggerCallback(name, ...args) {
        if (this._callbacks[name] && typeof this._callbacks[name] === 'function') {
            this._callbacks[name](...args);
        }
    }

    // ==================== 对外接口 API ====================

    /**
    * 设置数据源 (替代/更新下拉选项)
    * @param {Array} items - 字符串数组
    */
    setItems(items) {
        if (!Array.isArray(items)) {
            console.warn('TagSelect: setItems 参数需要是数组');
            return;
        }
        this._items = [...items];
        // 如果下拉菜单正在显示，刷新它
        if (this.dropdown.classList.contains('show')) {
            this._renderDropdown(this.input.value);
        }
        return this;
    }

    /**
    * 更新数据源 (追加/合并)
    * @param {Array} items - 字符串数组
    */
    updateItems(items) {
        if (!Array.isArray(items)) return this;
        // 去重合并
        const newItems = [...this._items, ...items];
        this._items = [...new Set(newItems)];
        if (this.dropdown.classList.contains('show')) {
            this._renderDropdown(this.input.value);
        }
        return this;
    }

    /**
    * 设置选中的值
    * @param {Array} values - 选中的值数组
    */
    setSelected(values) {
        if (!Array.isArray(values)) {
            console.warn('TagSelect: setSelected 参数需要是数组');
            return this;
        }
        // 过滤掉不在数据源中的值 (可选策略，这里允许设值)
        this._selected = [...values];
        this._renderTags();
        this._renderDropdown(this.input.value);
        
        // 触发 change 回调
        this._triggerCallback('change', this._selected);
        return this;
    }

    /**
    * 获取当前选中的所有值
    * @returns {Array}
    */
    getSelected() {
        return [...this._selected];
    }

    /**
    * 获取所有可选项
    * @returns {Array}
    */
    getItems() {
        return [...this._items];
    }

    /**
    * 绑定值变化事件
    * @param {Function} callback - 回调函数，参数为当前选中的数组
    */
    onChange(callback) {
        if (typeof callback === 'function') {
            this._callbacks.change = callback;
        }
        return this;
    }

    /**
    * 绑定选中事件
    * @param {Function} callback - 回调函数，参数为当前选中的项
    */
    onSelect(callback) {
        if (typeof callback === 'function') {
            this._callbacks.select = callback;
        }
        return this;
    }

    /**
    * 绑定移除事件
    * @param {Function} callback - 回调函数，参数为被移除的项
    */
    onRemove(callback) {
        if (typeof callback === 'function') {
            this._callbacks.remove = callback;
        }
        return this;
    }

    /**
    * 销毁组件，移除事件监听
    */
    destroy() {
        // 移除所有监听 (由于使用了 document 全局监听，需要特殊处理)
        // 在实际生产环境可以通过 cloneNode 替换或手动移除事件
        // 这里简单清空容器并重置
        this.container.innerHTML = '';
        this._selected = [];
        this._items = [];
        // 注意：document 上的监听器无法直接移除，需要更精细的管理
        // 建议在实际使用中重写这部分逻辑，或者使用微任务/生命周期管理
        console.log('TagSelect 已销毁');
    }
}

export {TagSelect}