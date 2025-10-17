/**
 * Icon Helper - SVG 图标辅助工具
 * 使用方法：icon('lock', 'w-5 h-5')
 */

/**
 * 生成 SVG 图标 HTML
 * @param {string} name - 图标名称（对应 icons.svg 中的 id）
 * @param {string} className - CSS 类名
 * @param {object} attrs - 额外的 HTML 属性
 * @returns {string} SVG HTML 字符串
 */
function icon(name, className = 'w-5 h-5', attrs = {}) {
  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<svg class="icon ${className}" ${attrString} aria-hidden="true" focusable="false">
    <use href="#icon-${name}"></use>
  </svg>`;
}

/**
 * 创建图标 DOM 元素
 * @param {string} name - 图标名称
 * @param {string} className - CSS 类名
 * @param {object} attrs - 额外的 HTML 属性
 * @returns {SVGElement} SVG DOM 元素
 */
function createIcon(name, className = 'w-5 h-5', attrs = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon', ...className.split(' '));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  Object.entries(attrs).forEach(([key, value]) => {
    svg.setAttribute(key, value);
  });

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${name}`);

  svg.appendChild(use);
  return svg;
}

/**
 * 图标名称映射（方便查找）
 */
const ICONS = {
  // 操作类
  LOCK: 'lock',
  UNLOCK: 'unlock',
  EYE: 'eye',
  EYE_OFF: 'eye-off',
  SHARE: 'share',
  QRCODE: 'qrcode',
  DOWNLOAD: 'download',
  COPY: 'copy',
  EDIT: 'edit',
  CHECK: 'check',
  X: 'x',
  SETTINGS: 'settings',
  MENU: 'menu',
  MORE_VERTICAL: 'more-vertical',

  // 状态类
  INFO: 'info',
  ALERT: 'alert-circle',
  SUCCESS: 'check-circle',
  LOADER: 'loader',

  // 内容类
  MARKDOWN: 'markdown',
  TEXT: 'text',
};

// 导出到全局
window.icon = icon;
window.createIcon = createIcon;
window.ICONS = ICONS;
