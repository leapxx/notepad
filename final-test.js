/**
 * 最终验证测试 - 确保优化后功能完整
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🎯 开始最终验证测试\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });

  // 测试三种典型设备
  const devices = [
    { name: '移动端 - iPhone 12', width: 390, height: 844 },
    { name: '平板端 - iPad Air', width: 820, height: 1180 },
    { name: '桌面端 - 1080p', width: 1920, height: 1080 }
  ];

  const testResults = [];

  for (const device of devices) {
    console.log(`\n📱 测试: ${device.name} (${device.width}x${device.height})`);

    const page = await browser.newPage({
      viewport: { width: device.width, height: device.height }
    });

    await page.goto('http://localhost:8787', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const results = {
      device: device.name,
      tests: []
    };

    // 1. 页面加载
    const pageLoaded = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    results.tests.push({ name: '页面加载', pass: pageLoaded });
    console.log(`  ${pageLoaded ? '✅' : '❌'} 页面加载`);

    // 2. 工具栏可见
    const toolbarVisible = await page.evaluate(() => {
      const footer = document.querySelector('.footer');
      if (!footer) return false;
      const rect = footer.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    results.tests.push({ name: '工具栏可见', pass: toolbarVisible });
    console.log(`  ${toolbarVisible ? '✅' : '❌'} 工具栏可见`);

    // 3. 编辑器可用
    const editorWorks = await page.evaluate(() => {
      const textarea = document.querySelector('#contents');
      return textarea !== null;
    });
    results.tests.push({ name: '编辑器可用', pass: editorWorks });
    console.log(`  ${editorWorks ? '✅' : '❌'} 编辑器可用`);

    // 4. 输入测试
    await page.fill('#contents', 'Test content for responsive design');
    await page.waitForTimeout(500);
    const inputWorks = await page.evaluate(() => {
      return document.querySelector('#contents').value.includes('Test content');
    });
    results.tests.push({ name: '文本输入', pass: inputWorks });
    console.log(`  ${inputWorks ? '✅' : '❌'} 文本输入`);

    // 5. 按钮可点击
    try {
      if (device.width <= 768) {
        // 移动端：检查底部工具栏
        const copyBtn = await page.locator('.opt-copy').first();
        await copyBtn.click({ timeout: 3000 });
      } else {
        // 桌面端：检查侧边工具栏
        const copyBtn = await page.locator('.opt-copy');
        await copyBtn.click({ timeout: 3000 });
      }
      await page.waitForTimeout(500);
      results.tests.push({ name: '按钮可点击', pass: true });
      console.log(`  ✅ 按钮可点击`);
    } catch (e) {
      results.tests.push({ name: '按钮可点击', pass: false });
      console.log(`  ❌ 按钮可点击: ${e.message}`);
    }

    // 6. 触摸目标检查
    const touchTargets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.opt-button, .switch, .switch-group, .btn-copy-all, .btn-edit');
      let allPass = true;

      for (const btn of buttons) {
        const rect = btn.getBoundingClientRect();
        const computed = window.getComputedStyle(btn);
        const isVisible = computed.display !== 'none' && rect.width > 0 && rect.height > 0;

        if (isVisible && (rect.width < 44 || rect.height < 44)) {
          allPass = false;
          break;
        }
      }

      return allPass;
    });
    results.tests.push({ name: '触摸目标达标', pass: touchTargets });
    console.log(`  ${touchTargets ? '✅' : '❌'} 触摸目标达标`);

    // 7. 无水平滚动
    const noHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    results.tests.push({ name: '无水平滚动', pass: noHorizontalScroll });
    console.log(`  ${noHorizontalScroll ? '✅' : '❌'} 无水平滚动`);

    testResults.push(results);

    // 截图
    await page.screenshot({
      path: `screenshots/final-test-${device.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`
    });

    await page.close();
  }

  // 汇总结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 最终测试汇总');
  console.log('='.repeat(60));

  let totalTests = 0;
  let totalPassed = 0;

  testResults.forEach(result => {
    console.log(`\n${result.device}:`);
    result.tests.forEach(test => {
      totalTests++;
      if (test.pass) totalPassed++;
      console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log(`通过率: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`);
  console.log('='.repeat(60));

  if (totalPassed === totalTests) {
    console.log('\n🎉 恭喜！所有测试通过！响应式优化成功！');
  } else {
    console.log(`\n⚠️  注意：有 ${totalTests - totalPassed} 项测试未通过`);
  }

  await browser.close();
})();
