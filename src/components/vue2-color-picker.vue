<template>
  <div class="color_box">
    <div class="el-color-picker">
      <!---->
      <div class="el-color-picker__trigger" id="colorBox" @click="handleClickPicker">
        <span class="el-color-picker__color"
          ><span class="el-color-picker__color-inner" :style="selectColor">
            <span class="rate">
              <img src="./icons8-arrow-24.png" alt="" />
            </span> </span
        ></span>
        <!-- <span class="el-color-picker__icon el-icon-arrow-down"></span> -->
      </div>
    </div>
    <div
      v-show="showSelectColor"
      id="colorPickerBox"
      ref="refBox"
      :class="['color_picker_wrapper', popperClass]"
    >
      <div class="color_picker_box" @mousedown.stop>
        <!-- 模式切换按钮 -->
        <div v-if="!disableModeSwitch" class="mode-switch">
          <button
            :class="['mode-btn', { active: currentMode === 'linear' }]"
            @click="switchMode('linear')"
          >
            纯色
          </button>
          <button
            :class="['mode-btn', { active: currentMode === 'gradient' }]"
            @click="switchMode('gradient')"
          >
            渐变
          </button>
        </div>

        <div v-if="currentMode === 'gradient'" class="color_hd">
          <div class="gcolor">
            <div v-if="!disableDeg" class="gcolor_deg">
              <div class="gcolor_deg_span">角度</div>
              <Slider v-model="deg" :min="0" :max="360" :show-tooltip="false" />
              <input v-model="deg" class="number_input" />
            </div>

            <div ref="refColorBar" class="gcolor_bar">
              <div
                class="gcolor_bar_bg"
                :style="`background:${barStyle}`"
                @click="handlePotBar"
              ></div>
              <div class="gcolor_bar_pot_box">
                <div
                  v-for="(item, index) in colors"
                  :key="`${item.pst}_${index}`"
                  class="gcolor_bar_pot"
                  :style="{
                    left: getBarPst(item.pst)
                  }"
                  :class="{
                    on: selectIndex === index
                  }"
                  @mousedown="sliderPotDown(index, $event)"
                  @click="clickGColorPot(index)"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="currentMode === 'gradient'" class="gradient_box">
          <template v-for="(item, index) in colors">
            <SketchColorPicker
              v-if="index === selectIndex"
              :key="`${item.pst}_${index}`"
              theme="light"
              :value="item.color"
              :sucker-hide="true"
              @input="changeColor"
            />
          </template>
        </div>

        <div v-else class="linear">
          <SketchColorPicker
            theme="light"
            :value="color.color"
            :sucker-hide="true"
            @input="changeColor"
          />
          <div class="el-color-dropdown__btns">
            <span class="el-color-dropdown__value">
              <div class="el-input el-input--mini">
                <input v-model="color.hex" type="text" autocomplete="off" class="el-input__inner" />
              </div>
            </span>
            <button
              type="button"
              class="el-button el-color-dropdown__link-btn el-button--text el-button--mini"
              @click="handleClearColor"
            >
              <span>清空</span>
            </button>
            <button
              type="button"
              class="el-button el-color-dropdown__btn el-button--default el-button--mini is-plain"
              @click="handleClosePicker"
            >
              <span>确定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorScale from 'color-scales';
import {
  cloneDeep,
  findParentElement,
  keepDecimal,
  parseGradient,
  parseColor,
  formatColor
} from '../utils/index';
import Slider from 'element-ui/lib/slider';
import { Sketch } from 'vue-color';
import 'element-ui/lib/theme-chalk/slider.css';
const doc = document.body;
let isSelectBoxMouseDown = false;

/**
 * https://www.npmjs.com/package/color-scales
 */
// :preset-colors="[
// '#f00', '#00ff00', '#00ff0055', 'rgb(201, 76, 76)', 'rgba(0,0,255,1)', 'hsl(89, 43%, 51%)', 'hsla(89, 43%, 51%, 0.6)'
// ]"
export default {
  name: 'ColorPickerGradient',
  components: {
    SketchColorPicker: Sketch,
    Slider
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  props: {
    // v-model 绑定值
    // 线性模式：支持 hex/rgb/rgba/hsl/hsla 字符串，如 '#409EFF' 或 'rgba(64, 158, 255, 1)'
    // 渐变模式：CSS gradient 字符串，如 'linear-gradient(90deg, #fff 0%, #000 100%)'
    modelValue: {
      type: String,
      default: ''
    },
    // 组件默认模式：'linear' 纯色 | 'gradient' 渐变色
    mode: {
      type: String,
      default: 'linear',
      validator: (value) => ['linear', 'gradient'].includes(value)
    },
    // 是否禁用模式切换按钮
    disableModeSwitch: {
      type: Boolean,
      default: false
    },
    // 是否支持透明度选择
    showAlpha: {
      type: Boolean,
      default: false
    },
    // 颜色格式：'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla'
    colorFormat: {
      type: String,
      default: 'hex',
      validator: (value) => ['hex', 'rgb', 'rgba', 'hsl', 'hsla'].includes(value)
    },
    // 预定义颜色数组
    predefine: {
      type: Array,
      default: () => []
    },
    // 组件尺寸：'large' | 'default' | 'small'
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 渐变模式特有：是否禁用角度调节
    disableDeg: {
      type: Boolean,
      default: false
    },
    // 下拉框的类名
    popperClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 当前模式（内部状态）
      currentMode: this.mode,
      // 当前颜色对象（线性模式）
      color: {
        hex: '',
        rgba: { r: 0, g: 0, b: 0, a: 0 },
        color: ''
      },
      // 渐变角度
      deg: 90,
      // 渐变色点数组
      colors: [],
      // 当前选中的渐变色点索引
      selectIndex: 0,
      // 拖拽相关状态
      startMovePst: 0,
      mouseStartPst: { x: 0, y: 0 },
      movePst: { x: 0, y: 0 },
      pageX: 0,
      pageY: 0,
      // 控制面板显示/隐藏
      showSelectColor: false
    };
  },
  computed: {
    // 渐变条背景样式
    barStyle() {
      if (!this.colors) {
        return '';
      }
      const colors = cloneDeep(this.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return `${item.color} ${keepDecimal(String(item.pst) || '', 5)}%`;
        });
      return `linear-gradient(${this.deg}deg, ${colors.join(',')})`;
    },
    // 触发按钮显示的颜色
    selectColor() {
      if (this.currentMode === 'linear') {
        return `color: #FFF; background-color:${this.color.color};`;
      } else {
        return `background:${this.barStyle}`;
      }
    },
    // 计算当前颜色值（用于 v-model）
    currentColorValue() {
      if (this.currentMode === 'linear') {
        return formatColor(this.color.rgba, this.colorFormat);
      } else {
        return this.barStyle;
      }
    }
  },
  watch: {
    // 监听 modelValue 变化，解析并更新内部状态
    modelValue: {
      handler(newValue) {
        if (this.currentMode === 'linear') {
          const colorObj = parseColor(newValue);
          this.color = colorObj;
        } else {
          const { deg, colors } = parseGradient(newValue);
          this.deg = deg;
          this.colors = colors;
          if (this.selectIndex >= colors.length) {
            this.selectIndex = colors.length - 1;
          }
        }
      },
      immediate: true
    },
    // 监听渐变样式变化
    barStyle: {
      handler(barStyle) {
        if (this.currentMode === 'linear') return;
        this.emitUpdate(barStyle);
      },
      deep: true
    },
    // 监听角度变化
    deg: {
      handler(newDeg) {
        const deg = Number(parseInt(newDeg)) || 0;
        if (deg > 360) {
          this.deg = 360;
        } else if (deg < 0) {
          this.deg = 0;
        } else {
          this.deg = deg;
        }
      }
    }
  },
  created() {
    // 初始化颜色值由 modelValue watcher 处理
    // 如果是渐变模式且没有传入值，设置默认渐变
    if (this.currentMode === 'gradient' && !this.modelValue) {
      this.colors = [
        {
          color: 'rgba(255, 255, 255, 1)',
          hex: '#ffffff',
          rgba: { r: 255, g: 255, b: 255, a: 1 },
          pst: 0
        },
        {
          color: 'rgba(0, 0, 0, 1)',
          hex: '#000000',
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          pst: 100
        }
      ];
    }
  },
  mounted() {
    this.bindEvents();
  },
  unmounted() {
    this.unbindEvents();
    this.unbindEventsDoc();
  },
  methods: {
    // 切换模式
    switchMode(mode) {
      if (this.currentMode === mode) return;
      this.currentMode = mode;

      // 切换模式时发送对应格式的初始值
      if (mode === 'linear') {
        const linearValue = formatColor(this.color.rgba, this.colorFormat);
        this.emitUpdate(linearValue);
        this.emitActiveChange(linearValue);
      } else {
        // 切换到渐变模式时，如果没有颜色点，设置默认值
        if (this.colors.length === 0) {
          this.colors = [
            {
              color: 'rgba(255, 255, 255, 1)',
              hex: '#ffffff',
              rgba: { r: 255, g: 255, b: 255, a: 1 },
              pst: 0
            },
            {
              color: 'rgba(0, 0, 0, 1)',
              hex: '#000000',
              rgba: { r: 0, g: 0, b: 0, a: 1 },
              pst: 100
            }
          ];
        }
        this.emitUpdate(this.barStyle);
        this.emitActiveChange(this.barStyle);
      }

      // 发送模式切换事件
      this.$emit('mode-change', mode);
    },
    // 发送 v-model 更新和事件
    emitUpdate(value) {
      this.$emit('update:modelValue', value);
      this.$emit('input', value); // 兼容 Vue 2.x v-model
    },
    // 发送 change 事件（确认后触发）
    emitChange(value) {
      this.$emit('change', value);
    },
    // 发送 active-change 事件（实时触发）
    emitActiveChange(value) {
      this.$emit('active-change', value);
    },
    bindEvents() {
      this.currentMode === 'gradient' && window.addEventListener('keyup', this.handleKeyup);
    },
    bindEventsDoc(useCapture = false) {
      doc.addEventListener('mousemove', this.handleEleMouseMove, useCapture);
      doc.addEventListener('mouseup', this.handleEleMouseUp, useCapture);
    },
    unbindEvents() {
      this.currentMode === 'gradient' && window.removeEventListener('keyup', this.handleKeyup);
      this.unbindEventsDoc();
    },
    unbindEventsDoc(useCapture = false) {
      doc.removeEventListener('mousemove', this.handleEleMouseMove, useCapture);
      doc.removeEventListener('mouseup', this.handleEleMouseUp, useCapture);
    },
    handleEleMouseMove(e) {
      if (!isSelectBoxMouseDown) return;
      this.movePst.x = e.pageX - this.mouseStartPst.x;
      this.movePst.y = e.pageY - this.mouseStartPst.y;
      this.pageX = e.pageX;
      this.pageY = e.pageY;
      this.sliderMove(e);
    },
    handleEleMouseUp(e) {
      isSelectBoxMouseDown = false;
      this.sliderDone(e);
    },
    resetDraggle() {
      isSelectBoxMouseDown = false;
      this.mouseStartPst = { x: 0, y: 0 };
      this.movePst.x = 0;
      this.movePst.y = 0;
      this.unbindEventsDoc();
    },
    handleClosePicker() {
      this.showSelectColor = false;
      this.$emit('visible-change', false);
      this.removeEventListener();
      this.unbindEvents();
      this.unbindEventsDoc();
      // 发送 change 事件（确认颜色）
      this.emitChange(this.currentColorValue);
    },
    handleClearColor() {
      const clearValue =
        this.mode === 'linear' ? '' : 'linear-gradient(90deg, transparent 0%, transparent 100%)';
      this.emitUpdate(clearValue);
      this.emitChange(clearValue);
      this.handleClosePicker();
    },
    handleKeyup(e) {
      if ([8, 46].includes(e.keyCode)) {
        this.deleteColorPot();
      }
    },
    deleteColorPot() {
      // 渐变色至少有两点
      if (this.colors.length === 2) return;
      this.colors.splice(this.selectIndex, 1);
      // 选中前一个色点
      this.selectIndex = Math.max(0, this.selectIndex - 1);
    },
    handlePotBar(e) {
      const barBounding = this.$refs.refColorBar.getBoundingClientRect();
      const barLeft = barBounding.left;
      const colorPotDist = e.pageX - barLeft;
      // 渐变条stopColors
      const rangColors = cloneDeep(this.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return item.hex;
        });

      // 初始化色条Range，用来取渐变色值
      const colorScale = new ColorScale(0, barBounding.width, rangColors);
      const colorPotHex = colorScale.getColor(colorPotDist).toHexString();
      const colorPotRgba = colorScale.getColor(colorPotDist).toRGBAString();
      const colorPotPst = (100 * colorPotDist) / barBounding.width;

      this.colors.push({
        color: colorPotRgba,
        rgba: colorPotRgba,
        hex: colorPotHex,
        pst: colorPotPst
      });

      // 增加后默认选中
      this.selectIndex = this.colors.length - 1;
    },
    sliderPotDown(index, $event) {
      this.bindEventsDoc();
      const e = $event;
      this.clickGColorPot(index);
      isSelectBoxMouseDown = true;
      this.mouseStartPst.x = e.pageX;
      this.mouseStartPst.y = e.pageY;
      this.sliderStart(e);
    },
    sliderStart() {
      this.startMovePst = this.colors[this.selectIndex].pst;
    },
    sliderMove() {
      const barWidth = this.$refs.refColorBar?.getBoundingClientRect().width;
      let distRatio = ((this.startMovePst * barWidth) / 100 + this.movePst.x) / barWidth;
      if (distRatio > 1) {
        distRatio = 1;
      } else if (distRatio < 0) {
        distRatio = 0;
      }
      this.colors[this.selectIndex].pst = Math.round(distRatio * 100);
    },
    sliderDone() {
      this.resetDraggle();
    },
    getBarPst(pst) {
      return `calc(${pst}% - 8px)`;
    },
    changeColor(color) {
      const rgba = color.rgba;
      const hex = color.hex;
      if (this.currentMode === 'linear') {
        const colorValue = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        this.color = {
          rgba,
          hex,
          color: colorValue
        };
        // 实时更新 v-model
        const formattedColor = formatColor(rgba, this.colorFormat);
        this.emitUpdate(formattedColor);
        this.emitActiveChange(formattedColor);
      } else {
        this.handleGradientColorChange(color);
        // 渐变模式实时更新
        this.emitActiveChange(this.barStyle);
      }
    },
    handleGradientColorChange(color) {
      const rgba = color.rgba;
      this.colors[this.selectIndex].color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      this.colors[this.selectIndex].hex = color.hex;
      this.colors[this.selectIndex].rgba = color.rgba;
    },
    clickGColorPot(index) {
      if (this.selectIndex === index) return;
      this.selectIndex = index;
    },
    handleClickPicker() {
      if (this.disabled) return;
      this.showSelectColor = !this.showSelectColor;
      this.$emit('visible-change', this.showSelectColor);
      if (this.showSelectColor) {
        setTimeout(() => {
          this.addEventListener();
          this.bindEvents();
        }, 0);
      } else {
        this.removeEventListener();
        this.unbindEvents();
      }
    },
    handleEvent(event) {
      // 获取触发点击事件的目标元素
      let targetElement = event.target;
      // 定义要匹配的选择器
      const targetSelector = '#colorBox';
      const targetpickerSelector = '#colorPickerBox';
      // 调用函数查找符合条件的父元素
      const colorBoxElement = findParentElement(targetElement, targetSelector);
      const boxPickerElement = findParentElement(targetElement, targetpickerSelector);
      if (colorBoxElement || !boxPickerElement) {
        return this.handleClosePicker();
      }
    },
    addEventListener() {
      window.addEventListener('click', this.handleEvent);
    },
    removeEventListener() {
      window.removeEventListener('click', this.handleEvent);
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.color_box {
  position: relative;
}
.color_picker_wrapper {
  position: absolute;
  top: 100%;
  width: 240px;
  z-index: 8888;
  .color_picker_box {
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    background: #f7f8f9;
    padding: 15px 10px;
    padding-top: 10px;
    :deep() {
      .hu-color-picker {
        box-shadow: none;
        border-radius: 0;
        background: #f7f8f9;
        padding: 0;
      }
    }

    // 模式切换按钮样式
    .mode-switch {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      padding: 4px;
      background: #e8e9eb;
      border-radius: 4px;

      .mode-btn {
        flex: 1;
        padding: 6px 12px;
        font-size: 12px;
        color: #606266;
        background: transparent;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;

        &:hover {
          color: #409eff;
        }

        &.active {
          color: #fff;
          background: #409eff;
          font-weight: 500;
        }
      }
    }

    .gcolor_deg {
      display: block;
      display: flex;
      align-items: center;
      .gcolor_deg_span {
        font-size: 12px;
        margin-right: 10px;
      }
      .number_input {
        min-width: 20px;
        max-width: 20px;
        float: none;
        order: 1;
        margin-left: 10px;
        margin-top: 0;
        display: flex;
        align-items: center;
        text-align: center;
        color: #606266;
        font-size: 12px;
        padding: 3px;
        background-color: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        &:focus {
          border-color: #409eff;
          outline: 0;
        }
      }
      :deep() {
        .el-input-number__decrease,
        .el-input-number__increase {
          display: none;
        }
        .el-input--mini .el-input__inner {
          padding: 0;
          width: 100% !important;
          height: 22px;
          line-height: 22px;
        }
        .el-slider {
          display: flex;
          flex: 1;
        }
        .el-slider__input {
          min-width: 2em;
          max-width: 2em;
          float: none;
          order: 1;
          margin-left: 10px;
          margin-top: 0;
          display: flex;
          align-items: center;
        }
        .el-slider__runway.show-input {
          margin-right: 0;
          flex: 1;
          order: 0;
          height: 3px;
        }
        .el-slider__button {
          width: 13px;
          height: 13px;
          border-color: #fff;
          box-shadow: 0 0 4px rgba($color: #000, $alpha: 0.4);
        }
        .el-slider__bar {
          height: 3px;
        }
        .el-slider__button-wrapper {
          top: -17px;
        }
      }
    }

    .color_hd {
      margin-bottom: 15px;
    }

    .color_hd_0 {
      margin-bottom: 0;
    }
    .title {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      padding-left: 4px;
      color: #606266;
      .close_box {
        font-style: normal;
        font-weight: 400;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        vertical-align: baseline;
        display: inline-block;
        color: #909399;
        width: 20px;
        height: 100%;
        font-size: 21px;
        cursor: pointer;
      }
    }
    .gcolor {
      position: relative;
      margin: 10px 0 20px;
    }
    .gcolor_bar {
      position: relative;
      margin-top: 3px;
      height: 16px;
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2M8c/X2fwYkYKylgsxlYKSDgv///6O44ey1O6huoL0CAJgaKeXe+C99AAAAAElFTkSuQmCC')
        repeat;
      border-radius: 2px;
    }
    .gcolor_bar_bg {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    .gcolor_bar_pot_box {
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      z-index: 1;
      width: calc(100% - 16px);
      pointer-events: none;
    }
    .gcolor_bar_pot {
      pointer-events: initial;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 16px;
      width: 12px;
      cursor: pointer;
      border: 2px solid #fff;
      &.on {
        &:before {
          visibility: visible;
        }
        z-index: 2;
      }
      &:after {
        content: '';
        position: absolute;
        left: -3px;
        right: -3px;
        top: -3px;
        bottom: -3px;
        border: 1px solid #999;
        border-radius: 3px;
      }
      &:before {
        content: '';
        position: absolute;
        left: -4px;
        right: -4px;
        top: -4px;
        bottom: -4px;
        border: 2px solid var(--hoverColor);
        visibility: hidden;
        z-index: 1;
        border-radius: 3px;
      }
    }
  }
}
.el-color-picker {
  display: inline-block;
  position: relative;
  line-height: normal;
  height: 40px;
}
.el-color-picker__trigger {
  display: inline-block;
  box-sizing: border-box;
  height: 40px;
  width: 40px;
  padding: 4px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 0;
  position: relative;
  cursor: pointer;
}
.el-color-picker__color {
  position: relative;
  display: block;
  box-sizing: border-box;
  border: 1px solid #999;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  text-align: center;
}
.el-color-picker__color-inner {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rate {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  > img {
    width: 24px;
    height: 24px;
  }
}
// bottom
.el-color-dropdown__btns {
  margin-top: 6px;
  text-align: right;
}
.el-color-dropdown__value {
  float: left;
  line-height: 26px;
  font-size: 12px;
  color: #000;
  width: 120px;
}
.el-input {
  position: relative;
  font-size: 14px;
  display: inline-block;
  width: 100%;
}
.el-input--mini {
  font-size: 12px;
}
.el-input__inner {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
.el-input--mini .el-input__inner {
  height: 28px;
  line-height: 28px;
}
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}
.el-button--mini {
  padding: 7px 15px;
  font-size: 12px;
  border-radius: 3px;
}
.el-button--text {
  border-color: transparent;
  color: #409eff;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}
.el-button + .el-button {
  margin-left: 10px;
}
</style>
