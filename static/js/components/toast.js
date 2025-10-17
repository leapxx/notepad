/**
 * Toast Component - Toast 通知组件
 * 支持队列、多类型、自动消失
 */

function toastComponent() {
  return {
    toasts: [],
    nextId: 1,

    init() {
      // 监听全局事件
      window.addEventListener('show-toast', (e) => {
        this.show(e.detail)
      })
    },

    // 显示 Toast
    show(options) {
      const toast = {
        id: this.nextId++,
        type: options.type || 'info', // 'info', 'success', 'error', 'loading'
        message: options.message || '',
        duration: options.duration !== undefined ? options.duration : 3000,
        action: options.action || null,
        actionText: options.actionText || '',
        dismissible: options.dismissible !== false,
        icon: this.getIcon(options.type || 'info'),
      }

      this.toasts.push(toast)

      // 自动消失（loading 类型不自动消失）
      if (toast.duration > 0 && toast.type !== 'loading') {
        setTimeout(() => {
          this.dismiss(toast.id)
        }, toast.duration)
      }

      return toast.id
    },

    // 关闭 Toast
    dismiss(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    // 关闭所有 Toast
    dismissAll() {
      this.toasts = []
    },

    // 执行操作
    handleAction(toast) {
      if (toast.action) {
        toast.action()
      }
      this.dismiss(toast.id)
    },

    // 获取图标
    getIcon(type) {
      const icons = {
        info: 'info',
        success: 'check-circle',
        error: 'alert-circle',
        loading: 'loader',
      }
      return icons[type] || 'info'
    },

    // 获取 Toast 样式类
    getToastClass(type) {
      const classes = {
        info: 'toast-info',
        success: 'toast-success',
        error: 'toast-error',
        loading: 'toast-loading',
      }
      return classes[type] || 'toast-info'
    }
  }
}

// 导出到全局
window.toastComponent = toastComponent

// 便捷方法
window.showToast = function(message, type = 'info', duration = 3000) {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration }
  }))
}

window.showSuccess = function(message, duration = 2000) {
  window.showToast(message, 'success', duration)
}

window.showError = function(message, duration = 4000) {
  window.showToast(message, 'error', duration)
}

window.showLoading = function(message = 'Loading...') {
  return new Promise((resolve) => {
    const id = window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type: 'loading', duration: 0 }
    }))
    resolve(id)
  })
}

window.dismissToast = function(id) {
  window.dispatchEvent(new CustomEvent('dismiss-toast', { detail: id }))
}
