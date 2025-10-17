/**
 * 响应式设计测试脚本
 * 测试常见设备尺寸和断点
 */

const { chromium } = require('playwright');

// 常见设备尺寸
const DEVICES = [
  // 移动端
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'Samsung Galaxy S23 Ultra', width: 412, height: 915 },

  // 平板
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro 11"', width: 834, height: 1194 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },

  // 笔记本/桌面
  { name: '小笔记本 13"', width: 1280, height: 800 },
  { name: '标准笔记本 15"', width: 1366, height: 768 },
  { name: '高清笔记本', width: 1920, height: 1080 },
  { name: '2K 显示器', width: 2560, height: 1440 },
  { name: '4K 显示器', width: 3840, height: 2160 },

  // 断点边界测试
  { name: '断点 768px', width: 768, height: 1024 },
  { name: '断点 769px', width: 769, height: 1024 },
  { name: '断点 1024px', width: 1024, height: 768 },
  { name: '断点 1025px', width: 1025, height: 768 },
];

(async () => {
  console.log('🧪 开始响应式设计测试\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const issues = [];

  for (const device of DEVICES) {
    console.log(`\n📱 测试设备: ${device.name} (${device.width}x${device.height})`);

    const page = await context.newPage({
      viewport: { width: device.width, height: device.height }
    });

    await page.goto('http://localhost:8787', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 检查关键元素
    const checks = await page.evaluate(() => {
      const results = {
        device: window.innerWidth + 'x' + window.innerHeight,
        issues: []
      };

      // 检查工具栏
      const footer = document.querySelector('.footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const styles = window.getComputedStyle(footer);

        results.footer = {
          visible: rect.width > 0 && rect.height > 0,
          position: styles.position,
          display: styles.display,
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          overflow: rect.bottom > window.innerHeight || rect.right > window.innerWidth,
          width: rect.width,
          height: rect.height
        };

        if (results.footer.overflow) {
          results.issues.push('工具栏溢出视口');
        }
      } else {
        results.issues.push('工具栏不存在');
      }

      // 检查编辑器
      const textarea = document.querySelector('#contents');
      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        results.textarea = {
          visible: rect.width > 0 && rect.height > 0,
          width: rect.width,
          height: rect.height,
          tooSmall: rect.height < 200
        };

        if (results.textarea.tooSmall) {
          results.issues.push('编辑器高度过小');
        }
      }

      // 检查按钮触摸目标（只检查可见元素）
      const buttons = document.querySelectorAll('.opt-button, .btn-copy-all, .btn-edit, .btn-done, .switch, .switch-group');
      let smallButtons = 0;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const computed = window.getComputedStyle(btn);
        // 只检查可见元素（排除 display:none 和 0尺寸）
        const isVisible = computed.display !== 'none' && rect.width > 0 && rect.height > 0;

        if (isVisible) {
          // WCAG 建议最小触摸目标 44x44px
          if (rect.width < 44 || rect.height < 44) {
            smallButtons++;
          }
        }
      });

      if (smallButtons > 0) {
        results.issues.push(`${smallButtons} 个按钮小于推荐触摸目标 (44x44px)`);
      }

      // 检查字体大小
      const body = document.body;
      const fontSize = parseFloat(window.getComputedStyle(body).fontSize);
      if (fontSize < 14) {
        results.issues.push(`主字体过小 (${fontSize}px)`);
      }

      // 检查水平滚动
      if (document.documentElement.scrollWidth > window.innerWidth) {
        results.issues.push('存在水平滚动');
      }

      return results;
    });

    // 输出结果
    if (checks.issues.length > 0) {
      console.log(`  ⚠️  发现问题:`);
      checks.issues.forEach(issue => console.log(`     - ${issue}`));
      issues.push({ device: device.name, issues: checks.issues });
    } else {
      console.log(`  ✅ 无明显问题`);
    }

    // 截图
    const filename = `screenshots/responsive-${device.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`  📸 截图: ${filename}`);

    await page.close();
  }

  // 汇总报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`测试设备数: ${DEVICES.length}`);
  console.log(`发现问题的设备: ${issues.length}`);

  if (issues.length > 0) {
    console.log('\n❌ 需要优化的设备:');
    issues.forEach(item => {
      console.log(`\n  ${item.device}:`);
      item.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  } else {
    console.log('\n✅ 所有设备测试通过！');
  }

  console.log('\n✨ 测试完成');
  await browser.close();
})();
