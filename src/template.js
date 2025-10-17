import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CDN_PREFIX, SUPPORTED_LANG } from './constant'

dayjs.extend(relativeTime)

// SVG 图标 Sprite（内联以避免额外请求）
const ICON_SPRITE = `<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="icon-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </symbol>
  <symbol id="icon-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </symbol>
  <symbol id="icon-qrcode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </symbol>
  <symbol id="icon-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </symbol>
  <symbol id="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </symbol>
  <symbol id="icon-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </symbol>
  <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </symbol>
  <symbol id="icon-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </symbol>
  <symbol id="icon-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </symbol>
  <symbol id="icon-alert-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </symbol>
  <symbol id="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </symbol>
  <symbol id="icon-loader" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </symbol>
  <symbol id="icon-markdown" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15V9l2 2 2-2v6m4-6v6l2-2"/>
  </symbol>
</svg>`

const SWITCHER = (text, open, className = '') => `
<label class="switch ${className}">
  <input type="checkbox" ${open ? 'checked' : ''} role="switch" aria-checked="${open ? 'true' : 'false'}" aria-label="${text}">
  <span class="switch-slider"></span>
</label>
`
const FOOTER = ({ lang, isEdit, updateAt, pw, mode, share }) => `
    <div class="footer" role="toolbar" aria-label="${SUPPORTED_LANG[lang].toolbar || 'Toolbar'}">
        ${isEdit ? `
            <div class="opt">
                <button class="opt-button opt-pw" aria-label="${pw ? SUPPORTED_LANG[lang].changePW : SUPPORTED_LANG[lang].setPW}">
                    <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-lock"></use></svg>
                    ${pw ? SUPPORTED_LANG[lang].changePW : SUPPORTED_LANG[lang].setPW}
                </button>
                <div class="switch-group">
                    <label class="switch-label">
                        <span class="opt-desc">Markdown</span>
                    </label>
                    ${SWITCHER('Markdown', mode === 'md', 'opt-mode')}
                </div>
                <div class="switch-group">
                    <label class="switch-label">
                        <span class="opt-desc">${SUPPORTED_LANG[lang].share}</span>
                    </label>
                    ${SWITCHER(SUPPORTED_LANG[lang].share, share, 'opt-share')}
                </div>
                <button class="opt-button opt-qr" title="${SUPPORTED_LANG[lang].qrCode}" aria-label="${SUPPORTED_LANG[lang].qrCode}">
                    <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-qrcode"></use></svg>
                    ${SUPPORTED_LANG[lang].qrCode}
                </button>
                <button class="opt-button opt-export" title="${SUPPORTED_LANG[lang].exportNote}" aria-label="${SUPPORTED_LANG[lang].exportNote}">
                    <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-download"></use></svg>
                    ${SUPPORTED_LANG[lang].exportNote}
                </button>
            </div>
            ` : ''
    }
        <div class="footer-right" role="status" aria-live="polite">
            ${isEdit ? `<span class="word-count" id="wordCount" aria-label="${SUPPORTED_LANG[lang].wordCount || 'Word count'}">${SUPPORTED_LANG[lang].chars}: 0 | ${SUPPORTED_LANG[lang].words}: 0</span>` : ''}
            ${updateAt ? `<span class="last-modified" aria-label="${SUPPORTED_LANG[lang].lastModified}">${SUPPORTED_LANG[lang].lastModified} ${dayjs.unix(updateAt).fromNow()}</span>` : ''}
        </div>
    </div>
`
const MODAL = lang => `
<div class="modal share-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <input type="text" readonly value="" />
            <button class="opt-button">${SUPPORTED_LANG[lang].copy}</button>
        </div>
    </div>
</div>
<div class="modal qr-modal">
    <div class="modal-mask"></div>
    <div class="modal-content">
        <span class="close-btn">x</span>
        <div class="modal-body">
            <div id="qrcode"></div>
            <p class="qr-tip">${SUPPORTED_LANG[lang].scanToView}</p>
        </div>
    </div>
</div>
`
const TOP_BAR = ({ lang, isEdit }) => isEdit ? `
    <div class="top-bar" id="topBar" style="display: none;" role="banner" aria-label="${SUPPORTED_LANG[lang].topBar || 'Top toolbar'}">
        <div class="top-bar-left">
            <button class="btn-copy-all" id="btnCopyAll" aria-label="${SUPPORTED_LANG[lang].copyAll}">
                <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-copy"></use></svg>
                ${SUPPORTED_LANG[lang].copyAll}
            </button>
            <button class="btn-edit" id="btnEdit" aria-label="${SUPPORTED_LANG[lang].edit}">
                <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-edit"></use></svg>
                ${SUPPORTED_LANG[lang].edit}
            </button>
            <button class="btn-done" id="btnDone" style="display: none;" aria-label="${SUPPORTED_LANG[lang].done}">
                <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-check"></use></svg>
                ${SUPPORTED_LANG[lang].done}
            </button>
        </div>
        <div class="top-bar-right">
            <span class="word-count-mobile" id="wordCountMobile" role="status" aria-live="polite"></span>
            <button class="btn-qr-mobile" id="btnQrMobile" title="${SUPPORTED_LANG[lang].qrCode}" aria-label="${SUPPORTED_LANG[lang].qrCode}">
                <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-qrcode"></use></svg>
            </button>
            <button class="btn-export-mobile" id="btnExportMobile" title="${SUPPORTED_LANG[lang].exportNote}" aria-label="${SUPPORTED_LANG[lang].exportNote}">
                <svg class="icon w-5 h-5" aria-hidden="true"><use href="#icon-download"></use></svg>
            </button>
        </div>
    </div>
` : ''
const HTML = ({ lang, title, content, ext = {}, tips, isEdit, showPwPrompt, showAppAuthPrompt, returnUrl }) => `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Serverless cloud notepad with password protection and markdown support" />
    <title>${title} — Cloud Notepad</title>
    <link href="${CDN_PREFIX}/favicon.ico" rel="shortcut icon" type="image/ico" />
    <link href="${CDN_PREFIX}/css/app.css" rel="stylesheet" media="screen" />
</head>
<body>
    <!-- 跳过导航链接（可访问性） -->
    <a href="#contents" class="skip-link">Skip to content</a>

    <!-- SVG 图标 Sprite -->
    <div style="display: none;">
        ${ICON_SPRITE}
    </div>

    ${TOP_BAR({ lang, isEdit })}
    <div class="note-container" role="document" aria-label="${SUPPORTED_LANG[lang].noteContainer || 'Note editor'}">
        <div class="stack">
            <div class="layer_1">
                <div class="layer_2">
                    <div class="layer_3">
                        ${tips ? `<div class="tips" role="alert">${tips}</div>` : ''}
                        <textarea
                            id="contents"
                            class="contents ${isEdit ? '' : 'hide'}"
                            spellcheck="true"
                            placeholder="${SUPPORTED_LANG[lang].emptyPH}"
                            aria-label="${SUPPORTED_LANG[lang].noteContent || 'Note content'}"
                            aria-multiline="true"
                            role="textbox"
                        >${content}</textarea>
                        ${(isEdit && ext.mode === 'md') ? '<div class="divide-line" aria-hidden="true"></div>' : ''}
                        ${tips || (isEdit && ext.mode !== 'md') ? '' : `<div id="preview-${ext.mode || 'plain'}" class="contents" role="article" aria-label="${SUPPORTED_LANG[lang].preview || 'Content preview'}"></div>`}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="loading" role="status" aria-live="polite" aria-atomic="true"></div>

    <!-- Alpine.js Toast 容器 -->
    <div x-data="toastComponent()"
         x-init="init()"
         class="toast-container"
         role="region"
         aria-label="Notifications"
         aria-live="polite">
        <template x-for="toast in toasts" :key="toast.id">
            <div :class="['toast', getToastClass(toast.type)]"
                 x-show="true"
                 x-transition:enter="animate-slideDown"
                 x-transition:leave="animate-fadeOut"
                 role="alert"
                 aria-atomic="true">
                <svg class="toast-icon w-5 h-5" :class="{ 'icon-loader': toast.type === 'loading' }" aria-hidden="true">
                    <use :href="'#icon-' + toast.icon"></use>
                </svg>
                <div class="toast-content">
                    <p class="toast-message" x-text="toast.message"></p>
                    <div x-show="toast.action" class="toast-actions">
                        <button @click="handleAction(toast)" class="toast-action" x-text="toast.actionText"></button>
                    </div>
                </div>
                <button x-show="toast.dismissible"
                        @click="dismiss(toast.id)"
                        class="toast-dismiss"
                        :aria-label="${SUPPORTED_LANG[lang].close || 'Close'}">
                    <svg class="icon w-4 h-4" aria-hidden="true">
                        <use href="#icon-x"></use>
                    </svg>
                </button>
            </div>
        </template>
    </div>

    ${MODAL(lang)}
    ${FOOTER({ ...ext, isEdit, lang })}

    <!-- 脚本加载 -->
    ${(ext.mode === 'md' || ext.share) ? `<script src="${CDN_PREFIX}/js/purify.min.js"></script>` : ''}
    ${ext.mode === 'md' ? `<script src="${CDN_PREFIX}/js/marked.min.js"></script>` : ''}
    ${isEdit ? `<script src="${CDN_PREFIX}/js/qrcode.min.js"></script>` : ''}

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <!-- 组件和工具 -->
    <script src="${CDN_PREFIX}/js/icons.js"></script>
    <script src="${CDN_PREFIX}/js/components/modal.js"></script>
    <script src="${CDN_PREFIX}/js/components/toast.js"></script>
    <script src="${CDN_PREFIX}/js/clip.js"></script>
    <script src="${CDN_PREFIX}/js/app.js"></script>

    ${showPwPrompt ? '<script>passwdPrompt()</script>' : ''}
    ${showAppAuthPrompt ? `<script>appPasswordPrompt('${returnUrl || '/'}')</script>` : ''}
</body>
</html>
`

export const Edit = data => HTML({ isEdit: true, ...data })
export const Share = data => HTML(data)
export const NeedPasswd = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipEncrypt, showPwPrompt: true, ...data })
export const AppAuth = data => HTML({ tips: SUPPORTED_LANG[data.lang].tipAppAuth, showAppAuthPrompt: true, ...data })
export const Page404 = data => HTML({ tips: SUPPORTED_LANG[data.lang].tip404, ...data })