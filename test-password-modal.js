/**
 * 密码模态框测试
 * 测试密码保护功能和模态框显示
 */

const { chromium } = require('playwright');

async function testPasswordModal() {
  console.log('🔐 开始密码模态框测试\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[浏览器 ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    // 测试路径
    const testPath = '/test-password-' + Date.now();

    console.log(`📝 步骤 1: 创建测试笔记 ${testPath}`);
    await page.goto(`http://localhost:56859${testPath}`);
    await page.waitForTimeout(2000);

    // 输入测试内容
    await page.fill('#contents', '这是一个测试笔记，用于验证密码保护功能。');
    await page.waitForTimeout(1000);

    console.log('🔒 步骤 2: 设置笔记密码');

    // 点击密码按钮
    await page.click('.opt-pw');
    await page.waitForTimeout(1500);

    // 检查模态框是否显示
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      if (!modal) return false;
      const styles = window.getComputedStyle(modal);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });

    console.log(`  模态框显示: ${modalVisible ? '✅' : '❌'}`);

    if (!modalVisible) {
      console.log('  ⚠️  模态框未显示，等待 Alpine.js 初始化...');
      await page.waitForTimeout(2000);
    }

    // 输入密码
    const passwordInput = await page.locator('.modal-input[type="password"]');
    await passwordInput.fill('test123');
    await page.waitForTimeout(500);

    // 点击确认
    await page.click('.btn-primary');
    await page.waitForTimeout(2000);

    console.log('✅ 密码设置完成\n');

    console.log('🔄 步骤 3: 重新访问笔记（模拟新用户）');

    // 清除 cookies 模拟新用户
    const cookies = await page.context().cookies();
    await page.context().clearCookies();

    // 重新访问
    await page.goto(`http://localhost:56859${testPath}`);
    await page.waitForTimeout(2000);

    console.log('🔍 步骤 4: 检查密码输入框是否显示');

    // 等待 Alpine.js 初始化和模态框显示
    await page.waitForTimeout(1500);

    // 检查提示文本
    const tipsText = await page.evaluate(() => {
      const tips = document.querySelector('.tips');
      return tips ? tips.textContent : null;
    });

    console.log(`  提示文本: ${tipsText ? '✅ "' + tipsText + '"' : '❌ 未找到'}`);

    // 检查密码模态框
    const passwordModalCheck = await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      const input = document.querySelector('.modal-input[type="password"]');
      const title = document.querySelector('.modal-title');

      return {
        modalExists: !!modal,
        modalVisible: modal ? window.getComputedStyle(modal).display !== 'none' : false,
        inputExists: !!input,
        inputFocused: document.activeElement === input,
        titleText: title ? title.textContent : null,
        alpineData: modal ? modal.getAttribute('x-data') : null
      };
    });

    console.log(`\n  📊 密码模态框检查结果:`);
    console.log(`    - 模态框存在: ${passwordModalCheck.modalExists ? '✅' : '❌'}`);
    console.log(`    - 模态框可见: ${passwordModalCheck.modalVisible ? '✅' : '❌'}`);
    console.log(`    - 输入框存在: ${passwordModalCheck.inputExists ? '✅' : '❌'}`);
    console.log(`    - 输入框聚焦: ${passwordModalCheck.inputFocused ? '✅' : '⚠️'}`);
    console.log(`    - 标题文本: ${passwordModalCheck.titleText || '❌ 未找到'}`);
    console.log(`    - Alpine 数据: ${passwordModalCheck.alpineData ? '✅' : '❌'}\n`);

    if (!passwordModalCheck.modalVisible) {
      console.log('  ❌ 密码模态框未显示！这是我们要修复的问题。\n');

      // 截图保存错误状态
      await page.screenshot({ path: 'screenshots/password-modal-error.png' });
      console.log('  📸 错误截图已保存: screenshots/password-modal-error.png\n');

      // 检查 Alpine.js 是否加载
      const alpineLoaded = await page.evaluate(() => {
        return typeof window.Alpine !== 'undefined';
      });
      console.log(`  Alpine.js 加载状态: ${alpineLoaded ? '✅' : '❌'}`);

      // 检查事件监听器
      const eventListeners = await page.evaluate(() => {
        const modal = document.querySelector('[x-data*="modalComponent"]');
        if (!modal) return 'Alpine 模态框元素不存在';

        // 检查 Alpine 是否已初始化该元素
        const alpineData = modal.__x;
        return alpineData ? '✅ Alpine 已初始化' : '❌ Alpine 未初始化';
      });
      console.log(`  Alpine 初始化状态: ${eventListeners}\n`);

    } else {
      console.log('  ✅ 密码模态框正常显示！\n');

      console.log('🔐 步骤 5: 测试密码输入');

      // 输入错误密码
      await page.fill('.modal-input[type="password"]', 'wrong');
      await page.click('.btn-primary');
      await page.waitForTimeout(1500);

      // 检查错误提示
      const errorShown = await page.evaluate(() => {
        const toasts = document.querySelectorAll('.toast');
        return toasts.length > 0;
      });
      console.log(`  错误密码提示: ${errorShown ? '✅ 显示错误提示' : '⚠️ 未显示'}`);

      await page.waitForTimeout(1000);

      // 输入正确密码
      console.log('\n🔓 步骤 6: 输入正确密码');
      const passwordInputCorrect = await page.locator('.modal-input');
      await passwordInputCorrect.fill('test123');
      await page.click('.btn-primary');
      await page.waitForTimeout(2000);

      // 检查内容是否显示
      const contentVisible = await page.evaluate(() => {
        const textarea = document.querySelector('#contents');
        return textarea && textarea.value.includes('测试笔记');
      });

      console.log(`  内容显示: ${contentVisible ? '✅ 正确解密并显示内容' : '❌ 内容未显示'}`);

      // 截图保存成功状态
      await page.screenshot({ path: 'screenshots/password-modal-success.png' });
      console.log(`  📸 成功截图已保存: screenshots/password-modal-success.png\n`);
    }

    console.log('📊 步骤 7: 测试其他模态框交互');

    // 重新触发密码模态框测试 ESC 关闭
    await page.context().clearCookies();
    await page.goto(`http://localhost:56859${testPath}`);
    await page.waitForTimeout(2000);

    // 测试 ESC 关闭
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const modalClosedByEsc = await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      return !modal || window.getComputedStyle(modal).display === 'none';
    });

    console.log(`  ESC 关闭模态框: ${modalClosedByEsc ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await page.screenshot({ path: 'screenshots/test-error.png' });
  } finally {
    console.log('\n⏱️  5秒后关闭浏览器...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testPasswordModal();
