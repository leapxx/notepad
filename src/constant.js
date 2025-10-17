// 开发环境使用本地文件，生产环境使用 CDN
export const NODE_ENV = 'development'
export const CDN_PREFIX = NODE_ENV === 'development'
    ? '/static'
    : '//gcore.jsdelivr.net/gh/s0urcelab/serverless-cloud-notepad@master/static'

export const SCN_SALT = 'test'
export const SCN_SECRET = 'test'
export const SCN_APP_PASSWORD = '' // 应用访问密码，留空则不启用保护

// server side salt
export const SALT = SCN_SALT
// server side secret
export const SECRET = SCN_SECRET
// app access password (empty = no protection)
export const APP_PASSWORD = SCN_APP_PASSWORD

// supported language
export const SUPPORTED_LANG = {
    'en': {
        setPW: 'Set Password',
        changePW: 'Change Password',
        share: 'Share',
        lastModified: 'Last Modified',
        copy: 'Copy',
        copyAll: 'Copy All',
        edit: 'Edit',
        done: 'Done',
        qrCode: 'QR Code',
        scanToView: 'Scan to view on mobile',
        exportNote: 'Export',
        chars: 'Chars',
        words: 'Words',
        emptyPH: 'There are many like it, but this one is mine...',
        tipEncrypt: 'This Note has been encrypted, please enter password!',
        tip404: '404, Nothing here',
        peapw: 'Please enter app password',
        tipAppAuth: 'This app is password protected!',
    },
    'zh': {
        setPW: '设置密码',
        changePW: '修改密码',
        share: '分享',
        lastModified: '上次保存',
        copy: '复制',
        copyAll: '复制全文',
        edit: '编辑',
        done: '完成',
        qrCode: '二维码',
        scanToView: '扫码在手机查看',
        exportNote: '导出',
        chars: '字符',
        words: '字数',
        emptyPH: '看来你是第一个到这儿的人，写点什么吧...',
        tipEncrypt: '这是一篇加密笔记，你必须先输入密码',
        tip404: '404，你要找的东西并不存在',
        peapw: '请输入应用密码',
        tipAppAuth: '此应用已设置访问密码！',
    }
}
