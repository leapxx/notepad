
const DEFAULT_LANG = 'en'
const SUPPORTED_LANG = {
    'en': {
        err: 'Error',
        pepw: 'Please enter password.',
        pwcnbe: 'Password is empty!',
        enpw: 'Enter a new password(Keeping it empty will remove the current password)',
        pwss: 'Password set successfully.',
        pwrs: 'Password removed successfully.',
        cpys: 'Copied!',
        cpyall: 'Copied all content!',
    },
    'zh': {
        err: '出错了',
        pepw: '请输入密码',
        pwcnbe: '密码不能为空！',
        enpw: '输入新密码（留空可清除当前密码）',
        pwss: '密码设置成功！',
        pwrs: '密码清除成功！',
        cpys: '已复制',
        cpyall: '已复制全文！',
    }
}

const getI18n = key => {
    const userLang = (navigator.language || navigator.userLanguage || DEFAULT_LANG).split('-')[0]
    const targetLang = Object.keys(SUPPORTED_LANG).find(l => l === userLang) || DEFAULT_LANG
    return SUPPORTED_LANG[targetLang][key]
}

// 检测是否为移动端
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Toast 提示 - 使用全局 window.showToast (已在 toast.js 中定义)
// 旧版本已移除，现在直接使用 window.showToast(), window.showSuccess(), window.showError()

// 复制全文功能（添加防抖标志防止重复触发）
let isCopying = false
const copyAllContent = () => {
    if (isCopying) return  // 防止重复点击

    const $textarea = document.querySelector('#contents')
    if ($textarea) {
        isCopying = true
        const text = $textarea.value
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                window.showSuccess(getI18n('cpyall'))
                setTimeout(() => { isCopying = false }, 500)  // 500ms后重置
            }).catch(err => {
                // 降级到传统方法
                fallbackCopyText(text)
                setTimeout(() => { isCopying = false }, 500)
            })
        } else {
            fallbackCopyText(text)
            setTimeout(() => { isCopying = false }, 500)
        }
    }
}

// 降级复制方法
const fallbackCopyText = (text) => {
    const $textarea = document.querySelector('#contents')
    if ($textarea) {
        const originalDisplay = $textarea.style.display
        const originalPosition = $textarea.style.position
        const originalLeft = $textarea.style.left

        // 临时显示但不影响布局（移到屏幕外）
        $textarea.style.display = 'block'
        $textarea.style.position = 'absolute'
        $textarea.style.left = '-9999px'

        $textarea.select()
        $textarea.setSelectionRange(0, 99999)
        try {
            document.execCommand('copy')
            window.showSuccess(getI18n('cpyall'))
        } catch (err) {
            window.showError(getI18n('err'))
        } finally {
            // 恢复原状态
            $textarea.style.display = originalDisplay
            $textarea.style.position = originalPosition
            $textarea.style.left = originalLeft
        }
    }
}

// 字数统计
const updateWordCount = (text) => {
    const chars = text.length
    // 中文字 + 英文单词数
    const words = (text.match(/[\u4e00-\u9fa5]|[a-zA-Z]+/g) || []).length

    const $wordCount = document.querySelector('#wordCount')
    const $wordCountMobile = document.querySelector('#wordCountMobile')

    const userLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0]
    const charsText = userLang === 'zh' ? '字符' : 'Chars'
    const wordsText = userLang === 'zh' ? '字数' : 'Words'

    const countText = `${charsText}: ${chars} | ${wordsText}: ${words}`

    if ($wordCount) $wordCount.textContent = countText
    if ($wordCountMobile) $wordCountMobile.textContent = countText
}

// 二维码功能
const showQRCode = () => {
    const $qrModal = document.querySelector('.qr-modal')
    const $qrcode = document.querySelector('#qrcode')

    if ($qrModal && $qrcode) {
        // 清空之前的二维码
        $qrcode.innerHTML = ''

        // 生成新的二维码
        const url = window.location.href
        new QRCode($qrcode, {
            text: url,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        })

        // 显示模态框
        $qrModal.style.display = 'block'
    }
}

// 导出功能
const exportNote = () => {
    const $textarea = document.querySelector('#contents')
    if (!$textarea) return

    const content = $textarea.value
    const path = location.pathname.slice(1) || 'note'
    const date = new Date().toISOString().slice(0, 10)

    // 判断是否为 Markdown 模式
    const isMdMode = document.querySelector('.opt-mode > input')?.checked
    const ext = isMdMode ? 'md' : 'txt'

    // 处理路径中的特殊字符
    const safePath = path.replace(/[/\\:*?"<>|]/g, '-')
    const filename = `${safePath}-${date}.${ext}`

    // 创建 Blob 并下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

// 查看/编辑模式切换
let isViewMode = false
const toggleViewMode = (viewMode) => {
    isViewMode = viewMode
    const $textarea = document.querySelector('#contents')
    const $previewMd = document.querySelector('#preview-md')
    const $previewPlain = document.querySelector('#preview-plain')
    const $preview = $previewMd || $previewPlain  // 统一处理两种预览
    const $divideLine = document.querySelector('.divide-line')
    const $btnEdit = document.querySelector('#btnEdit')
    const $btnDone = document.querySelector('#btnDone')
    const $btnCopyAll = document.querySelector('#btnCopyAll')
    const $footer = document.querySelector('.footer')

    // 移除所有模式 class
    document.body.classList.remove('mobile-view-mode', 'mobile-edit-mode')

    if (isViewMode) {
        // 查看模式：只显示预览
        document.body.classList.add('mobile-view-mode')
        if ($textarea) $textarea.style.display = 'none'
        if ($divideLine) $divideLine.style.display = 'none'
        if ($preview) {
            $preview.style.display = 'block'
            $preview.style.flex = '1'
        }
        if ($btnEdit) $btnEdit.style.display = 'inline-block'
        if ($btnDone) $btnDone.style.display = 'none'
        if ($btnCopyAll) $btnCopyAll.style.display = 'inline-block'
        if ($footer) $footer.style.display = 'none'
    } else {
        // 编辑模式：桌面端显示左右分栏，移动端只显示编辑器（CSS 控制）
        document.body.classList.add('mobile-edit-mode')
        if ($textarea) $textarea.style.display = 'block'
        if ($divideLine) $divideLine.style.display = 'block'
        if ($preview) {
            $preview.style.display = 'block'
            $preview.style.flex = '1'
        }
        if ($btnEdit) $btnEdit.style.display = 'none'
        if ($btnDone) $btnDone.style.display = 'inline-block'
        if ($btnCopyAll) $btnCopyAll.style.display = 'none'
        if ($footer) $footer.style.display = 'flex'
    }
}

const errHandle = (err) => {
    window.showError(`${getI18n('err')}: ${err}`)
}

const throttle = (func, delay) => {
    let tid = null

    return (...arg) => {
        if (tid) return;

        tid = setTimeout(() => {
            func(...arg)
            tid = null
        }, delay)
    }
}

const appPasswordPrompt = (returnUrl) => {
    window.showPasswordPrompt({
        title: getI18n('peapw'),
        onConfirm: (passwd) => {
            if (!passwd.trim()) {
                window.showError(getI18n('pwcnbe'))
                // 重新显示密码提示
                setTimeout(() => appPasswordPrompt(returnUrl), 500)
                return
            }

            window.fetch('/auth/app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    passwd,
                    returnUrl,
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        window.showError(getI18n('err') + ': ' + res.msg)
                        // 重新显示密码提示
                        setTimeout(() => appPasswordPrompt(returnUrl), 500)
                        return
                    }
                    if (res.data.redirect) {
                        window.location.href = res.data.redirect
                    }
                })
                .catch(err => {
                    errHandle(err)
                    // 重新显示密码提示
                    setTimeout(() => appPasswordPrompt(returnUrl), 500)
                })
        },
        onCancel: () => {
            // 用户取消，返回
            window.history.back()
        }
    })
}

const passwdPrompt = () => {
    window.showPasswordPrompt({
        title: getI18n('pepw'),
        onConfirm: (passwd) => {
            if (!passwd.trim()) {
                window.showError(getI18n('pwcnbe'))
                // 重新显示密码提示
                setTimeout(() => passwdPrompt(), 500)
                return
            }
            const path = location.pathname
            window.fetch(`${path}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    passwd,
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        errHandle(res.msg)
                        // 重新显示密码提示
                        setTimeout(() => passwdPrompt(), 500)
                        return
                    }
                    if (res.data.refresh) {
                        window.location.reload()
                    }
                })
                .catch(err => {
                    errHandle(err)
                    // 重新显示密码提示
                    setTimeout(() => passwdPrompt(), 500)
                })
        }
    })
}

const renderPlain = (node, text) => {
    if (node) {
        node.innerHTML = DOMPurify.sanitize(text)
    }
}

const renderMarkdown = (node, text) => {
    if (node) {
        const parseText = marked.parse(text)
        node.innerHTML = DOMPurify.sanitize(parseText)
    }
}

window.addEventListener('DOMContentLoaded', function () {
    const $textarea = document.querySelector('#contents')
    const $loading = document.querySelector('#loading')
    const $pwBtn = document.querySelector('.opt-pw')
    const $modeBtn = document.querySelector('.opt-mode > input')
    const $shareBtn = document.querySelector('.opt-share > input')
    const $previewPlain = document.querySelector('#preview-plain')
    const $previewMd = document.querySelector('#preview-md')
    const $shareModal = document.querySelector('.share-modal')
    const $closeBtn = document.querySelector('.share-modal .close-btn')
    const $copyBtn = document.querySelector('.share-modal .opt-button')
    const $shareInput = document.querySelector('.share-modal input')
    const $topBar = document.querySelector('#topBar')
    const $btnCopyAll = document.querySelector('#btnCopyAll')
    const $btnCopyDesktop = document.querySelector('.opt-copy')  // 桌面端复制按钮
    const $btnEdit = document.querySelector('#btnEdit')
    const $btnDone = document.querySelector('#btnDone')
    const $qrBtn = document.querySelector('.opt-qr')
    const $qrBtnMobile = document.querySelector('#btnQrMobile')
    const $exportBtn = document.querySelector('.opt-export')
    const $exportBtnMobile = document.querySelector('#btnExportMobile')
    const $qrModal = document.querySelector('.qr-modal')
    const $qrCloseBtn = document.querySelectorAll('.qr-modal .close-btn')[0]

    renderPlain($previewPlain, $textarea.value)
    renderMarkdown($previewMd, $textarea.value)

    // 初始化字数统计
    if ($textarea) {
        updateWordCount($textarea.value)
    }

    // 移动端初始化
    if (isMobile() && $topBar) {
        $topBar.style.display = 'flex'
        // 只有存在预览元素时才切换到查看模式
        const $preview = $previewPlain || $previewMd
        if ($preview) {
            toggleViewMode(true) // 默认查看模式
        }
    }

    // 复制全文按钮（移动端）
    if ($btnCopyAll) {
        $btnCopyAll.onclick = function () {
            copyAllContent()
        }
    }

    // 复制全文按钮（桌面端）
    if ($btnCopyDesktop) {
        $btnCopyDesktop.onclick = function () {
            copyAllContent()
        }
    }

    // 编辑按钮
    if ($btnEdit) {
        $btnEdit.onclick = function () {
            toggleViewMode(false)
        }
    }

    // 完成按钮
    if ($btnDone) {
        $btnDone.onclick = function () {
            toggleViewMode(true)
        }
    }

    if ($textarea) {
        $textarea.oninput = throttle(function () {
            renderMarkdown($previewMd, $textarea.value)
            // 更新字数统计
            updateWordCount($textarea.value)

            $loading.style.display = 'inline-block'
            const data = {
                t: $textarea.value,
            }

            window.fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        errHandle(res.msg)
                    }
                })
                .catch(err => errHandle(err))
                .finally(() => {
                    $loading.style.display = 'none'
                })
        }, 300)
    }

    if ($pwBtn) {
        $pwBtn.onclick = function () {
            window.showPasswordPrompt({
                title: getI18n('enpw'),
                onConfirm: (passwd) => {
                    const path = window.location.pathname
                    window.fetch(`${path}/pw`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            passwd: passwd.trim(),
                        }),
                    })
                        .then(res => res.json())
                        .then(res => {
                            if (res.err !== 0) {
                                return errHandle(res.msg)
                            }
                            window.showSuccess(passwd ? getI18n('pwss') : getI18n('pwrs'))
                        })
                        .catch(err => errHandle(err))
                }
            })
        }
    }

    if ($modeBtn) {
        $modeBtn.onchange = function (e) {
            const isMd = this.checked
            const path = window.location.pathname
            window.fetch(`${path}/setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: isMd ? 'md' : 'plain',
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg)
                    }

                    window.location.reload()
                })
                .catch(err => errHandle(err))
        }
    }

    if ($shareBtn) {
        $shareBtn.onchange = function (e) {
            const isShare = this.checked
            const path = window.location.pathname
            window.fetch(`${path}/setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    share: isShare,
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (res.err !== 0) {
                        return errHandle(res.msg)
                    }

                    if (isShare) {
                        const origin = window.location.origin
                        const url = `${origin}/share/${res.data}`
                        // show modal
                        $shareInput.value = url
                        $shareModal.style.display = 'block'
                    }
                })
                .catch(err => errHandle(err))
        }
    }

    if ($shareModal) {
        $closeBtn.onclick = function () {
            $shareModal.style.display = 'none'

        }
        $copyBtn.onclick = function () {
            clipboardCopy($shareInput.value)
            const originText = $copyBtn.innerHTML
            const originColor = $copyBtn.style.background
            $copyBtn.innerHTML = getI18n('cpys')
            $copyBtn.style.background = 'orange'
            window.setTimeout(() => {
                $shareModal.style.display = 'none'
                $copyBtn.innerHTML = originText
                $copyBtn.style.background = originColor
            }, 1500)
        }
    }

    // 二维码按钮
    if ($qrBtn) {
        $qrBtn.onclick = function () {
            showQRCode()
        }
    }

    if ($qrBtnMobile) {
        $qrBtnMobile.onclick = function () {
            showQRCode()
        }
    }

    // 二维码模态框关闭
    if ($qrModal && $qrCloseBtn) {
        $qrCloseBtn.onclick = function () {
            $qrModal.style.display = 'none'
        }
        // 点击遮罩关闭
        $qrModal.querySelector('.modal-mask').onclick = function () {
            $qrModal.style.display = 'none'
        }
    }

    // 导出按钮
    if ($exportBtn) {
        $exportBtn.onclick = function () {
            exportNote()
        }
    }

    if ($exportBtnMobile) {
        $exportBtnMobile.onclick = function () {
            exportNote()
        }
    }

})
