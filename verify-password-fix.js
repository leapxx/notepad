/**
 * 简化验证测试 - 快速验证密码模态框修复
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔐 快速验证密码模态框修复\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const testPath = '/verify-pwd-' + Date.now();

  try {
    // 步骤 1: 创建笔记并设置密码
    console.log('步骤 1: 创建笔记并设置密码');
    await page.goto(`http://localhost:56859${testPath}`);
    await page.waitForTimeout(2000);

    await page.fill('#contents', '密码保护测试笔记');
    await page.click('.opt-pw');
    await page.waitForTimeout(1500);

    await page.fill('.modal-input[type="password"]', 'test123');
    await page.click('.btn-primary');
    await page.waitForTimeout(2000);

    console.log('✅ 密码设置完成\n');

    // 步骤 2: 清除 cookies 并重新访问
    console.log('步骤 2: 清除 cookies 模拟新访问');
    await page.context().clearCookies();
    await page.goto(`http://localhost:56859${testPath}`);
    await page.waitForTimeout(2000);

    // 步骤 3: 检查密码模态框
    console.log('步骤 3: 检查密码模态框是否显示\n');

    const modalCheck = await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      const input = document.querySelector('.modal-input');
      const title = document.querySelector('.modal-title');
      const tips = document.querySelector('.tips');

      return {
        tipsText: tips ? tips.textContent.trim() : null,
        modalVisible: modal ? window.getComputedStyle(modal).display !== 'none' : false,
        inputVisible: input ? window.getComputedStyle(input).display !== 'none' : false,
        titleText: title ? title.textContent.trim() : null
      };
    });

    console.log('📊 检查结果:');
    console.log(`  提示文本: ${modalCheck.tipsText}`);
    console.log(`  ${modalCheck.modalVisible ? '✅' : '❌'} 密码模态框可见`);
    console.log(`  ${modalCheck.inputVisible ? '✅' : '❌'} 密码输入框可见`);
    console.log(`  ${modalCheck.titleText ? '✅' : '❌'} 模态框标题: ${modalCheck.titleText}`);

    if (modalCheck.modalVisible && modalCheck.inputVisible) {
      console.log('\n🎉 修复成功！密码输入框正常显示！');

      // 截图
      await page.screenshot({ path: 'screenshots/password-fix-verified.png', fullPage: true });
      console.log('📸 截图已保存: screenshots/password-fix-verified.png');
    } else {
      console.log('\n❌ 修复失败！密码输入框未显示！');
      await page.screenshot({ path: 'screenshots/password-fix-failed.png', fullPage: true });
    }

  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
  } finally {
    console.log('\n⏱️  3秒后关闭浏览器...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
