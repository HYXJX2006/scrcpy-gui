<template>
  <div class="about">
    <div class="hero">
      <div class="logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h1>scrcpy GUI</h1>
      <p class="version">v1.0.0</p>
      <p class="tagline">Android 设备投屏控制 - 可视化界面</p>
    </div>

    <div class="info-cards">
      <n-card title="关于" size="small">
        <p>scrcpy GUI 是开源项目 <a href="https://github.com/Genymobile/scrcpy" target="_blank">scrcpy</a> 的图形化界面封装。</p>
        <p>scrcpy (v4.0) 由 <a href="https://www.genymobile.com" target="_blank">Genymobile</a> 开发，采用 Apache 2.0 开源协议。</p>
      </n-card>

      <n-card title="技术栈" size="small">
        <n-space vertical>
          <n-tag v-for="tech in techStack" :key="tech.name" size="small">{{ tech.name }} {{ tech.version }}</n-tag>
        </n-space>
      </n-card>

      <n-card title="功能" size="small">
        <ul>
          <li v-for="feature in features" :key="feature">{{ feature }}</li>
        </ul>
      </n-card>

      <n-card title="快捷键参考" size="small">
        <n-table :bordered="false" :single-line="false" size="small">
          <thead>
            <tr><th>快捷键</th><th>功能</th></tr>
          </thead>
          <tbody>
            <tr><td><n-tag size="tiny">Ctrl+f</n-tag></td><td>全屏</td></tr>
            <tr><td><n-tag size="tiny">Ctrl+o</n-tag></td><td>息屏</td></tr>
            <tr><td><n-tag size="tiny">Ctrl+r</n-tag></td><td>旋转</td></tr>
            <tr><td><n-tag size="tiny">Ctrl+s</n-tag></td><td>截屏</td></tr>
            <tr><td><n-tag size="tiny">Ctrl+v</n-tag></td><td>粘贴</td></tr>
            <tr><td><n-tag size="tiny">鼠标右键</n-tag></td><td>返回</td></tr>
            <tr><td><n-tag size="tiny">鼠标中键</n-tag></td><td>主页</td></tr>
          </tbody>
        </n-table>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const techStack = [
  { name: 'Electron', version: '34+' },
  { name: 'Vue 3', version: '3.5+' },
  { name: 'TypeScript', version: '5.7+' },
  { name: 'Naive UI', version: '2.41+' },
  { name: 'scrcpy', version: '4.0' }
]

const features = [
  'USB / WiFi 无线连接',
  '视频编码 H264/H265/AV1',
  '音频转发 (Android 11+)',
  '屏幕录制 (MP4/MKV)',
  '分辨率/帧率/码率控制',
  '虚拟显示 & 摄像头镜像',
  '预设配置方案',
  '息屏投屏'
]
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 40px 0;
}

.logo {
  margin-bottom: 16px;
}

.hero h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.version {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.tagline {
  color: #4A90D9;
  font-size: 16px;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 4px 0;
  color: #2c3e50;
  font-size: 14px;
}

li::before {
  content: '✓ ';
  color: #a6e3a1;
}
</style>
