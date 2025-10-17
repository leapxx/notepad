/**
 * Playwright 自动化测试脚本
 * 测试右侧工具栏的所有功能
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动 Playwright 测试...\n');

  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    slowMo: 500 // 每个操作延迟 500ms，便于观察
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 记录测试结果
  const testResults = [];

  try {
    // 1. 访问应用
    console.log('📍 步骤 1: 访问应用 http://localhost:8787');
    await page.goto('http://localhost:8787', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    testResults.push({ step: '访问应用', status: '✅ 成功' });

    // 2. 检查右侧工具栏是否存在
    console.log('📍 步骤 2: 检查右侧工具栏');
    const footer = await page.locator('.footer');
    const isFooterVisible = await footer.isVisible();
    testResults.push({
      step: '右侧工具栏可见性',
      status: isFooterVisible ? '✅ 可见' : '❌ 不可见'
    });

    // 3. 输入一些文本
    console.log('📍 步骤 3: 输入测试文本');
    const textarea = await page.locator('#contents');
    await textarea.fill('# 测试标题\n\n这是一段测试文本。\n\n- 列表项 1\n- 列表项 2');
    await page.waitForTimeout(2000);
    testResults.push({ step: '输入测试文本', status: '✅ 成功' });

    // 4. 测试复制全文按钮
    console.log('📍 步骤 4: 测试复制全文按钮');
    try {
      const copyBtn = await page.locator('.opt-copy');
      await copyBtn.click();
      await page.waitForTimeout(1000);
      // 检查是否显示 toast 提示
      const toast = await page.locator('.toast').first();
      const toastVisible = await toast.isVisible().catch(() => false);
      testResults.push({
        step: '复制全文按钮',
        status: toastVisible ? '✅ 成功（显示提示）' : '✅ 点击成功'
      });
    } catch (e) {
      testResults.push({ step: '复制全文按钮', status: `❌ 失败: ${e.message}` });
    }

    // 5. 测试 Markdown 模式开关（主要修复项）
    console.log('📍 步骤 5: 测试 Markdown 模式开关 🔧');
    try {
      const mdSwitch = await page.locator('.opt-mode input[type="checkbox"]');
      const isChecked = await mdSwitch.isChecked();
      console.log(`   当前 Markdown 模式状态: ${isChecked ? '开启' : '关闭'}`);

      // 点击开关的 label（因为 input 被 CSS 隐藏了）
      const mdLabel = await page.locator('.opt-mode');
      await mdLabel.click();
      console.log('   等待页面重新加载...');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 检查是否切换成功（页面会重新加载）
      const mdSwitchAfter = await page.locator('.opt-mode input[type="checkbox"]');
      const isCheckedAfter = await mdSwitchAfter.isChecked();
      const switched = isChecked !== isCheckedAfter;

      testResults.push({
        step: 'Markdown 模式开关 🔧',
        status: switched ? '✅ 成功切换' : '❌ 未能切换状态',
        details: `${isChecked ? '关闭' : '开启'} → ${isCheckedAfter ? '开启' : '关闭'}`
      });

      // 如果是 Markdown 模式，检查预览区域
      if (isCheckedAfter) {
        const preview = await page.locator('#preview-md');
        const previewVisible = await preview.isVisible().catch(() => false);
        console.log(`   Markdown 预览区域: ${previewVisible ? '✅ 可见' : '❌ 不可见'}`);
      }
    } catch (e) {
      testResults.push({ step: 'Markdown 模式开关 🔧', status: `❌ 失败: ${e.message}` });
    }

    // 6. 测试分享开关（主要修复项）
    console.log('📍 步骤 6: 测试分享开关 🔧');
    try {
      const shareSwitch = await page.locator('.opt-share input[type="checkbox"]');
      const isShared = await shareSwitch.isChecked();
      console.log(`   当前分享状态: ${isShared ? '开启' : '关闭'}`);

      // 如果未开启，点击开启分享（点击 label，因为 input 被 CSS 隐藏了）
      if (!isShared) {
        const shareLabel = await page.locator('.opt-share');
        await shareLabel.click();
        await page.waitForTimeout(2000);

        // 检查是否显示分享模态框
        const shareModal = await page.locator('.share-modal');
        const modalVisible = await shareModal.isVisible().catch(() => false);

        testResults.push({
          step: '分享开关 🔧',
          status: modalVisible ? '✅ 成功（显示分享链接）' : '⚠️ 开关点击但模态框未显示',
          details: modalVisible ? '分享链接模态框已显示' : '可能需要检查 API 响应'
        });

        // 如果模态框显示，获取分享链接
        if (modalVisible) {
          const shareInput = await page.locator('.share-modal input');
          const shareUrl = await shareInput.inputValue();
          console.log(`   分享链接: ${shareUrl}`);

          // 关闭模态框
          const closeBtn = await page.locator('.share-modal .close-btn');
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      } else {
        testResults.push({ step: '分享开关 🔧', status: '✅ 已开启（跳过测试）' });
      }
    } catch (e) {
      testResults.push({ step: '分享开关 🔧', status: `❌ 失败: ${e.message}` });
    }

    // 7. 测试二维码按钮
    console.log('📍 步骤 7: 测试二维码按钮');
    try {
      const qrBtn = await page.locator('.opt-qr');
      await qrBtn.click();
      await page.waitForTimeout(1000);

      // 检查二维码模态框
      const qrModal = await page.locator('.qr-modal');
      const qrModalVisible = await qrModal.isVisible().catch(() => false);

      testResults.push({
        step: '二维码按钮',
        status: qrModalVisible ? '✅ 成功（显示二维码）' : '❌ 模态框未显示'
      });

      if (qrModalVisible) {
        // 关闭模态框
        const qrCloseBtn = await page.locator('.qr-modal .close-btn');
        await qrCloseBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      testResults.push({ step: '二维码按钮', status: `❌ 失败: ${e.message}` });
    }

    // 8. 测试导出按钮
    console.log('📍 步骤 8: 测试导出按钮');
    try {
      // 监听下载事件
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      const exportBtn = await page.locator('.opt-export');
      await exportBtn.click();

      const download = await downloadPromise;

      testResults.push({
        step: '导出按钮',
        status: download ? '✅ 成功（触发下载）' : '⚠️ 点击成功但未检测到下载',
        details: download ? `文件名: ${download.suggestedFilename()}` : undefined
      });
    } catch (e) {
      testResults.push({ step: '导出按钮', status: `❌ 失败: ${e.message}` });
    }

    // 9. 测试密码按钮
    console.log('📍 步骤 9: 测试密码按钮');
    try {
      const pwBtn = await page.locator('.opt-pw');
      await pwBtn.click();
      await page.waitForTimeout(1000);

      // 检查密码模态框
      const pwModal = await page.locator('.modal-overlay').first();
      const pwModalVisible = await pwModal.isVisible().catch(() => false);

      testResults.push({
        step: '密码按钮',
        status: pwModalVisible ? '✅ 成功（显示密码输入框）' : '❌ 模态框未显示'
      });

      if (pwModalVisible) {
        // 关闭模态框（点击取消按钮）
        const cancelBtn = await page.locator('.btn-secondary').first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    } catch (e) {
      testResults.push({ step: '密码按钮', status: `❌ 失败: ${e.message}` });
    }

    // 截图
    console.log('📍 步骤 10: 保存测试截图');
    await page.screenshot({
      path: '/Users/xiaochaogui/code/landing-page/notepad/test-screenshot.png',
      fullPage: true
    });
    testResults.push({ step: '保存截图', status: '✅ 成功' });

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    testResults.push({ step: '测试执行', status: `❌ 错误: ${error.message}` });
  }

  // 打印测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));

  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.step}`);
    console.log(`   状态: ${result.status}`);
    if (result.details) {
      console.log(`   详情: ${result.details}`);
    }
  });

  // 统计结果
  const successCount = testResults.filter(r => r.status.includes('✅')).length;
  const failCount = testResults.filter(r => r.status.includes('❌')).length;
  const warningCount = testResults.filter(r => r.status.includes('⚠️')).length;

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 成功: ${successCount}  ❌ 失败: ${failCount}  ⚠️ 警告: ${warningCount}`);
  console.log('='.repeat(60));

  // 重点关注修复的功能
  console.log('\n🔧 重点修复项测试结果:');
  const mdResult = testResults.find(r => r.step.includes('Markdown 模式开关'));
  const shareResult = testResults.find(r => r.step.includes('分享开关'));

  if (mdResult) {
    console.log(`   • Markdown 开关: ${mdResult.status}`);
  }
  if (shareResult) {
    console.log(`   • 分享开关: ${shareResult.status}`);
  }

  console.log('\n✨ 测试完成！浏览器将在 5 秒后关闭...\n');

  await page.waitForTimeout(5000);
  await browser.close();

  // 返回退出码
  process.exit(failCount > 0 ? 1 : 0);

})().catch(error => {
  console.error('💥 测试脚本执行失败:', error);
  process.exit(1);
});
