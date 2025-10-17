
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

// Toast 提示
const showToast = (message) => {
    const toast = document.querySelector('#toast')
    if (toast) {
        toast.textContent = message
        toast.classList.add('show')
        setTimeout(() => {
            toast.classList.remove('show')
        }, 2000)
    }
}

// 复制全文功能
const copyAllContent = () => {
    const $textarea = document.querySelector('#contents')
    if ($textarea) {
        const text = $textarea.value
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(getI18n('cpyall'))
            }).catch(err => {
                // 降级到传统方法
                fallbackCopyText(text)
            })
        } else {
            fallbackCopyText(text)
        }
    }
}

// 降级复制方法
const fallbackCopyText = (text) => {
    const $textarea = document.querySelector('#contents')
    if ($textarea) {
        $textarea.select()
        $textarea.setSelectionRange(0, 99999)
        try {
            document.execCommand('copy')
            showToast(getI18n('cpyall'))
        } catch (err) {
            alert(getI18n('err'))
        }
    }
}

// 查看/编辑模式切换
let isViewMode = false
const toggleViewMode = (viewMode) => {
    isViewMode = viewMode
    const $textarea = document.querySelector('#contents')
    const $previewMd = document.querySelector('#preview-md')
    const $divideLine = document.querySelector('.divide-line')
    const $btnEdit = document.querySelector('#btnEdit')
    const $btnDone = document.querySelector('#btnDone')
    const $btnCopyAll = document.querySelector('#btnCopyAll')
    const $footer = document.querySelector('.footer')

    if (isViewMode) {
        // 查看模式：只显示预览
        if ($textarea) $textarea.style.display = 'none'
        if ($divideLine) $divideLine.style.display = 'none'
        if ($previewMd) {
            $previewMd.style.display = 'block'
            $previewMd.style.flex = '1'
        }
        if ($btnEdit) $btnEdit.style.display = 'inline-block'
        if ($btnDone) $btnDone.style.display = 'none'
        if ($btnCopyAll) $btnCopyAll.style.display = 'inline-block'
        if ($footer) $footer.style.display = 'none'
    } else {
        // 编辑模式：显示编辑器和预览
        if ($textarea) $textarea.style.display = 'block'
        if ($divideLine) $divideLine.style.display = 'block'
        if ($previewMd) {
            $previewMd.style.display = 'block'
            $previewMd.style.flex = '1'
        }
        if ($btnEdit) $btnEdit.style.display = 'none'
        if ($btnDone) $btnDone.style.display = 'inline-block'
        if ($btnCopyAll) $btnCopyAll.style.display = 'none'
        if ($footer) $footer.style.display = 'flex'
    }
}

const errHandle = (err) => {
    alert(`${getI18n('err')}: ${err}`)
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
    const passwd = window.prompt(getI18n('peapw'))
    if (passwd == null) {
        // 用户取消，返回
        window.history.back()
        return
    }

    if (!passwd.trim()) {
        alert(getI18n('pwcnbe'))
        return appPasswordPrompt(returnUrl)
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
                alert(getI18n('err') + ': ' + res.msg)
                return appPasswordPrompt(returnUrl)
            }
            if (res.data.redirect) {
                window.location.href = res.data.redirect
            }
        })
        .catch(err => {
            errHandle(err)
            appPasswordPrompt(returnUrl)
        })
}

const passwdPrompt = () => {
    const passwd = window.prompt(getI18n('pepw'))
    if (passwd == null) return;

    if (!passwd.trim()) {
        alert(getI18n('pwcnbe'))
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
                return errHandle(res.msg)
            }
            if (res.data.refresh) {
                window.location.reload()
            }
        })
        .catch(err => errHandle(err))
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
    const $btnEdit = document.querySelector('#btnEdit')
    const $btnDone = document.querySelector('#btnDone')

    renderPlain($previewPlain, $textarea.value)
    renderMarkdown($previewMd, $textarea.value)

    // 移动端初始化
    if (isMobile() && $topBar && $previewMd) {
        $topBar.style.display = 'flex'
        const $noteContainer = document.querySelector('.note-container')
        if ($noteContainer) {
            $noteContainer.style.marginTop = '60px'
        }
        toggleViewMode(true) // 默认查看模式
    }

    // 复制全文按钮
    if ($btnCopyAll) {
        $btnCopyAll.onclick = function () {
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
            const passwd = window.prompt(getI18n('enpw'))
            if (passwd == null) return;

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
                    alert(passwd ? getI18n('pwss') : getI18n('pwrs'))
                })
                .catch(err => errHandle(err))
        }
    }

    if ($modeBtn) {
        $modeBtn.onclick = function (e) {
            const isMd = e.target.checked
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
        $shareBtn.onclick = function (e) {
            const isShare = e.target.checked
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

})
