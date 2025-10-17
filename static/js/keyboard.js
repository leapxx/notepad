/**
 * Keyboard Navigation - 键盘导航和可访问性辅助
 * 提供全局快捷键和焦点管理
 */

class KeyboardNavigation {
  constructor() {
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.shortcuts = new Map();
    this.init();
  }

  init() {
    // 全局键盘事件监听
    document.addEventListener('keydown', (e) => {
      this.handleGlobalShortcuts(e);
      this.handleTabNavigation(e);
    });

    // 设置焦点指示器
    this.setupFocusIndicator();
  }

  /**
   * 注册快捷键
   * @param {string} key - 按键组合 (e.g., 'Ctrl+S', 'Escape')
   * @param {Function} handler - 处理函数
   * @param {string} description - 快捷键描述
   */
  registerShortcut(key, handler, description = '') {
    this.shortcuts.set(key.toLowerCase(), { handler, description });
  }

  /**
   * 处理全局快捷键
   */
  handleGlobalShortcuts(e) {
    const key = this.getKeyCombo(e);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      e.preventDefault();
      shortcut.handler(e);
    }

    // 内置快捷键
    switch (key) {
      case 'escape':
        this.handleEscape();
        break;
      case '?':
      case 'shift+/':
        if (!this.isInputFocused()) {
          this.showShortcutsHelp();
        }
        break;
    }
  }

  /**
   * 获取按键组合字符串
   */
  getKeyCombo(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }

  /**
   * 处理 ESC 键
   */
  handleEscape() {
    // 关闭所有打开的模态框
    const modals = document.querySelectorAll('.modal[style*="display: flex"], .modal.show');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.classList.remove('show');
    });

    // 取消焦点（如果在输入框中）
    if (this.isInputFocused()) {
      document.activeElement.blur();
    }
  }

  /**
   * 检查当前焦点是否在输入元素上
   */
  isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.contentEditable === 'true');
  }

  /**
   * Tab 键导航增强
   */
  handleTabNavigation(e) {
    if (e.key !== 'Tab') return;

    // 模态框焦点陷阱
    const openModal = document.querySelector('.modal[style*="display: flex"], .modal.show');
    if (openModal) {
      this.trapFocusInModal(openModal, e);
    }
  }

  /**
   * 焦点陷阱（模态框内）
   */
  trapFocusInModal(modal, e) {
    const focusable = Array.from(modal.querySelectorAll(this.focusableElements));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /**
   * 设置焦点指示器（仅键盘操作时显示）
   */
  setupFocusIndicator() {
    let isUsingKeyboard = false;

    // 检测键盘使用
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('user-is-tabbing');
      }
    });

    // 检测鼠标使用
    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.body.classList.remove('user-is-tabbing');
    });
  }

  /**
   * 获取所有可聚焦元素
   */
  getFocusableElements(root = document) {
    return Array.from(root.querySelectorAll(this.focusableElements))
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  /**
   * 聚焦第一个可聚焦元素
   */
  focusFirst(root = document) {
    const elements = this.getFocusableElements(root);
    if (elements.length > 0) {
      elements[0].focus();
    }
  }

  /**
   * 显示快捷键帮助
   */
  showShortcutsHelp() {
    const shortcuts = Array.from(this.shortcuts.entries())
      .map(([key, { description }]) => `${key}: ${description}`)
      .join('\n');

    const helpText = `
快捷键列表：
${shortcuts}

ESC: 关闭模态框/取消焦点
Tab: 在元素间导航
Shift+Tab: 反向导航
?: 显示此帮助
    `.trim();

    if (window.showModal) {
      window.showModal({
        type: 'alert',
        title: '键盘快捷键',
        message: helpText.replace(/\n/g, '<br>'),
        confirmText: '关闭'
      });
    } else {
      alert(helpText);
    }
  }
}

// 全局实例
const keyboardNav = new KeyboardNavigation();

// 注册常用快捷键（示例）
keyboardNav.registerShortcut('ctrl+s', (e) => {
  // 保存快捷键（如果需要）
  console.log('Save shortcut triggered');
}, '保存笔记');

keyboardNav.registerShortcut('ctrl+k', (e) => {
  // 命令面板（未来可扩展）
  console.log('Command palette shortcut triggered');
}, '打开命令面板');

// 导出到全局
window.keyboardNav = keyboardNav;
