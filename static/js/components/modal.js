/**
 * Modal Component - 模态框组件
 * 基于 Alpine.js 的可访问模态框
 */

function modalComponent() {
  return {
    open: false,
    type: 'default', // 'default', 'password', 'confirm', 'share', 'qr'
    title: '',
    message: '',
    value: '',
    inputType: 'text',
    showPassword: false,
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    onCancel: null,
    focusTrap: null,

    init() {
      // 监听 ESC 键关闭
      this.$watch('open', value => {
        if (value) {
          document.body.style.overflow = 'hidden'
          this.setupFocusTrap()
          this.$nextTick(() => {
            // 自动聚焦第一个可聚焦元素
            const firstInput = this.$el.querySelector('input, button')
            if (firstInput) firstInput.focus()
          })
        } else {
          document.body.style.overflow = ''
          this.teardownFocusTrap()
        }
      })
    },

    // 打开模态框
    show(options = {}) {
      this.type = options.type || 'default'
      this.title = options.title || ''
      this.message = options.message || ''
      this.value = options.value || ''
      this.inputType = options.inputType || 'text'
      this.showPassword = false
      this.confirmText = options.confirmText || (this.getLanguage() === 'zh' ? '确定' : 'Confirm')
      this.cancelText = options.cancelText || (this.getLanguage() === 'zh' ? '取消' : 'Cancel')
      this.onConfirm = options.onConfirm
      this.onCancel = options.onCancel
      this.open = true
    },

    // 关闭模态框
    close() {
      this.open = false
      this.value = ''
      this.inputType = 'text'
      if (this.onCancel) this.onCancel()
    },

    // 确认
    confirm() {
      if (this.onConfirm) {
        this.onConfirm(this.value)
      }
      this.open = false
      this.value = ''
    },

    // 切换密码显示
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
      this.inputType = this.showPassword ? 'text' : 'password'
    },

    // 焦点陷阱设置
    setupFocusTrap() {
      const modal = this.$el
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      this.focusTrap = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }

        if (e.key === 'Escape') {
          this.close()
        }
      }

      modal.addEventListener('keydown', this.focusTrap)
    },

    teardownFocusTrap() {
      if (this.focusTrap) {
        this.$el.removeEventListener('keydown', this.focusTrap)
        this.focusTrap = null
      }
    },

    // 获取语言
    getLanguage() {
      const userLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0]
      return ['zh', 'en'].includes(userLang) ? userLang : 'en'
    },

    // 点击遮罩关闭
    handleBackdropClick(e) {
      if (e.target === e.currentTarget) {
        this.close()
      }
    }
  }
}

// 导出到全局
window.modalComponent = modalComponent

// 便捷方法
window.showModal = function(options) {
  // 触发自定义事件通知 Alpine 组件
  window.dispatchEvent(new CustomEvent('show-modal', { detail: options }))
}

window.showPasswordPrompt = function(options = {}) {
  window.showModal({
    type: 'password',
    title: options.title || (getI18n('pepw') || 'Enter Password'),
    inputType: 'password',
    ...options
  })
}

window.showConfirm = function(options = {}) {
  window.showModal({
    type: 'confirm',
    ...options
  })
}

window.showAlert = function(message, title = '') {
  window.showModal({
    type: 'alert',
    title: title,
    message: message,
    confirmText: 'OK'
  })
}

// 辅助函数
function getI18n(key) {
  const SUPPORTED_LANG = {
    'en': {
      pepw: 'Please enter password',
      pwcnbe: 'Password cannot be empty',
      enpw: 'Enter a new password (leave empty to remove)',
    },
    'zh': {
      pepw: '请输入密码',
      pwcnbe: '密码不能为空',
      enpw: '输入新密码（留空可清除当前密码）',
    }
  }
  const userLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0]
  const targetLang = ['zh', 'en'].includes(userLang) ? userLang : 'en'
  return SUPPORTED_LANG[targetLang][key]
}
