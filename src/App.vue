<template>
  <div id="app">
    <h2>Element-Plus 风格颜色选择器</h2>

    <div class="demo-section">
      <h3>基础用法 - 自动切换模式</h3>
      <p class="desc">点击颜色选择器后，可以通过顶部的"纯色/渐变"按钮切换模式</p>
      <div class="color-pickers">
        <div class="picker-item">
          <label>通用颜色选择器</label>
          <ColorPicker
            v-model="unifiedColor"
            @change="handleUnifiedChange"
            @mode-change="handleModeChange"
          />
          <div class="preview-box" :style="{ background: unifiedColor }"></div>
          <code>v-model: {{ unifiedColor }}</code>
          <code v-if="currentMode">当前模式: {{ currentMode === 'linear' ? '纯色' : '渐变' }}</code>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>线性颜色选择器 (Linear Color Picker)</h3>
      <div class="color-pickers">
        <div class="picker-item">
          <label>基础用法 (Hex)</label>
          <ColorPicker v-model="color1" mode="linear" @change="handleChange1" />
          <div class="preview-box" :style="{ background: color1 }"></div>
          <code>v-model: {{ color1 }}</code>
        </div>

        <div class="picker-item">
          <label>带透明度 (RGBA)</label>
          <ColorPicker
            v-model="color2"
            mode="linear"
            show-alpha
            color-format="rgba"
            @change="handleChange2"
            @active-change="handleActiveChange2"
          />
          <div class="preview-box" :style="{ background: color2 }"></div>
          <code>v-model: {{ color2 }}</code>
        </div>

        <div class="picker-item">
          <label>HSL 格式</label>
          <ColorPicker v-model="color3" mode="linear" color-format="hsl" @change="handleChange3" />
          <div class="preview-box" :style="{ background: color3 }"></div>
          <code>v-model: {{ color3 }}</code>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>渐变颜色选择器 (Gradient Color Picker)</h3>
      <div class="color-pickers">
        <div class="picker-item">
          <label>基础渐变</label>
          <ColorPicker v-model="gradient1" mode="gradient" @change="handleGradientChange1" />
          <div class="preview-box gradient-box" :style="{ background: gradient1 }"></div>
          <code class="gradient-code">{{ gradient1 }}</code>
        </div>

        <div class="picker-item">
          <label>禁用角度调节</label>
          <ColorPicker
            v-model="gradient2"
            mode="gradient"
            disable-deg
            @change="handleGradientChange2"
          />
          <div class="preview-box gradient-box" :style="{ background: gradient2 }"></div>
          <code class="gradient-code">{{ gradient2 }}</code>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>禁用模式切换</h3>
      <p class="desc">通过 disable-mode-switch 属性禁用内部切换按钮</p>
      <div class="color-pickers">
        <div class="picker-item">
          <label>固定为纯色模式</label>
          <ColorPicker v-model="color1" mode="linear" disable-mode-switch />
        </div>
        <div class="picker-item">
          <label>固定为渐变模式</label>
          <ColorPicker v-model="gradient1" mode="gradient" disable-mode-switch />
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>组件尺寸 (Size)</h3>
      <div class="color-pickers size-demo">
        <ColorPicker v-model="color1" size="large" />
        <ColorPicker v-model="color1" size="default" />
        <ColorPicker v-model="color1" size="small" />
      </div>
    </div>

    <div class="demo-section">
      <h3>禁用状态 (Disabled)</h3>
      <div class="color-pickers">
        <ColorPicker v-model="color1" disabled />
      </div>
    </div>
  </div>
</template>

<script>
import ColorPicker from './components/vue2-color-picker.vue';

export default {
  name: 'App',
  components: {
    ColorPicker
  },
  data() {
    return {
      // 统一颜色（可切换模式）
      unifiedColor: '',
      currentMode: 'linear',

      // 线性颜色
      color1: '#409EFF',
      color2: 'rgba(64, 158, 255, 0.8)',
      color3: 'hsl(210, 100%, 62%)',

      // 渐变颜色
      gradient1: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)',
      gradient2: 'linear-gradient(180deg, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)'
    };
  },
  methods: {
    handleUnifiedChange(value) {
      console.log('Unified color changed:', value);
    },
    handleModeChange(mode) {
      console.log('Mode changed to:', mode);
      this.currentMode = mode;
    },
    handleChange1(value) {
      console.log('Color 1 changed:', value);
    },
    handleChange2(value) {
      console.log('Color 2 changed:', value);
    },
    handleActiveChange2(value) {
      console.log('Color 2 active change:', value);
    },
    handleChange3(value) {
      console.log('Color 3 changed:', value);
    },
    handleGradientChange1(value) {
      console.log('Gradient 1 changed:', value);
    },
    handleGradientChange2(value) {
      console.log('Gradient 2 changed:', value);
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

h3 {
  color: #606266;
  margin: 20px 0 10px;
  font-size: 18px;
}

.desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 15px 0;
}

.demo-section {
  margin-bottom: 50px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.color-pickers {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.picker-item {
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  code {
    background: #f4f4f5;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    font-family: 'Courier New', monospace;
    word-break: break-all;
  }

  .gradient-code {
    max-width: 300px;
  }
}

.preview-box {
  width: 150px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gradient-box {
  width: 300px;
}

.size-demo {
  align-items: center;
  gap: 20px;
}
</style>
