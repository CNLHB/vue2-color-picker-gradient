<template>
  <div class="color_box">
    <div class="el-color-picker">
      <!---->
      <div class="el-color-picker__trigger" id="colorBox" @click="handleClickPicker">
        <span class="el-color-picker__color"
          ><span class="el-color-picker__color-inner" :style="selectColor"> &times; </span></span
        ><span class="el-color-picker__icon el-icon-arrow-down"></span>
      </div>
    </div>
    <div v-show="showSelectColor" id="colorPickerBox" ref="refBox" class="color_picker_wrapper">
      <div class="color_picker_box" @mousedown.stop>
        <div
          class="color_hd"
          :class="!(showClose || titleConfig.show) && !titleConfig.text ? 'color_hd_0' : ''"
        >
          <div v-if="type === gradType" class="gcolor">
            <div v-if="titleConfig.show !== false" class="title">
              <span :style="titleConfig.style || {}">{{ titleConfig.text }}</span>
              <span v-if="showClose" class="close_box" @click="handleClosePicker">x</span>
            </div>
            <div v-if="!disabledColorDeg" class="gcolor_deg">
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
        <div v-if="type === gradType" class="gradient_box">
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
            <span class="el-color-dropdown__value"
              ><div class="el-input el-input--mini">
                <input
                  v-model="color.hex"
                  type="text"
                  autocomplete="off"
                  class="el-input__inner"
                /></div></span
            ><button
              type="button"
              class="el-button el-color-dropdown__link-btn el-button--text el-button--mini"
              @click="handleClearColor"
            >
              <span> 清空 </span></button
            ><button
              type="button"
              class="el-button el-color-dropdown__btn el-button--default el-button--mini is-plain"
              @click="handleClosePicker"
            >
              <span> 确定 </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ColorScale from 'color-scales';
import { cloneDeep, findParentElement, keepDecimal } from '../utils/index';
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
  props: {
    value: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'linear'
    },
    disabledColorDeg: {
      type: Boolean,
      default: false
    },
    pDeg: {
      type: Number,
      default: 90
    },
    pColor: {
      type: Object,
      default() {
        return {
          hex: '#194d33',
          hex8: '#194d33',
          hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
          hsv: { h: 150, s: 0.66, v: 0.3, a: 1 },
          rgba: { r: 25, g: 77, b: 51, a: 1 },
          a: 1,
          color: 'rgba(0,0,0,1)'
        };
      }
    },
    pColors: {
      type: Array,
      default() {
        return [
          {
            color: 'rgba(255, 255, 255, 1)',
            hex: '#ffffff',
            rgba: { r: 255, g: 255, b: 255, a: 1 },
            pst: 100
          },
          {
            color: 'rgba(0, 0, 0, 1)',
            hex: '#000000',
            rgba: { r: 0, g: 0, b: 0, a: 1 },
            pst: 0
          }
        ];
      }
    },
    showClose: {
      type: Boolean,
      default: true
    },
    closeOnClickBody: {
      type: Boolean,
      default: false
    },
    titleConfig: {
      type: Object,
      default() {
        return {
          show: true,
          text: '渐变选择器',
          style: {}
        };
      }
    }
  },
  data() {
    return {
      color: {
        hex: '#194d33',
        hex8: '#194d33',
        hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
        hsv: { h: 150, s: 0.66, v: 0.3, a: 1 },
        rgba: { r: 25, g: 77, b: 51, a: 1 },
        a: 1,
        color: 'rgba(0,0,0,1)'
      },
      deg: 0,
      colors: [],
      selectIndex: 0,
      startMovePst: 0,
      mouseStartPst: { x: 0, y: 0 },
      movePst: {
        x: 0,
        y: 0
      },
      pageX: 0,
      pageY: 0,
      gradType: 'gradient',
      showSelectColor: false
    };
  },
  computed: {
    barStyle() {
      if (!this.colors) {
        return '';
      }
      const colors = cloneDeep(this.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return `${item.color} ${keepDecimal(String(item.pst) || '', 5)}%`;
        });
      return `linear-gradient(${this.deg}deg, ${colors.join(',')});`;
    },
    selectColor() {
      if (this.type === 'linear') {
        return `color: #FFF; background-color:${this.color.color};`;
      } else {
        return `background:${this.barStyle}`;
      }
    }
  },
  watch: {
    value: {
      handler(visible) {
        if (!visible) {
          this.unbindEvents();
          this.unbindEventsDoc();
        } else {
          this.bindEvents();
        }
      },
      deep: true
    },
    barStyle: {
      handler(barStyle) {
        if (this.type === 'linear') return;
        this.emitColorChange({
          style: barStyle
        });
      },
      deep: true
    },
    pColor: {
      handler(pColor) {
        this.color = cloneDeep(pColor);
      },
      deep: true
    },
    pColors: {
      handler(pColors) {
        if (this.selectIndex >= pColors.length) {
          this.selectIndex = pColors.length - 1;
        }
        this.colors = cloneDeep(pColors);
      },
      deep: true
    },
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
    this.deg = this.pDeg;
    this.colors = this.pColors;
    if (typeof this.pColor === 'string') {
      this.pColor.indexOf('#') !== -1
        ? (this.color.hex = this.pColor)
        : (this.color.color = this.pColor);
    } else {
      this.color = this.pColor;
    }
    if (this.pColors.length < 2) {
      this.warn('The pColors default length cannot be less than 2');
    }
  },
  mounted() {
    this.initColors();
    this.value && this.bindEvents();
  },
  unmounted() {
    this.unbindEvents();
    this.unbindEventsDoc();
  },
  methods: {
    initColors() {
      // 初始化颜色值
      if (this.type === this.gradType) {
        const renderList = cloneDeep(this.colors).sort((a, b) => a.pst - b.pst);
        this.selectIndex = this.colors.findIndex((item) => item.pst === renderList[0].pst);
        this.$nextTick(() => {
          this.emitColorChange({
            style: this.barStyle
          });
        });
      } else {
        this.emitColorChange({
          color: cloneDeep(this.color)
        });
      }
    },
    bindEvents() {
      this.type === this.gradType && window.addEventListener('keyup', this.handleKeyup);
      if (this.closeOnClickBody) {
        window.addEventListener('mousedown', this.handleClosePicker);
      }
    },
    bindEventsDoc(useCapture = false) {
      doc.addEventListener('mousemove', this.handleEleMouseMove, useCapture);
      doc.addEventListener('mouseup', this.handleEleMouseUp, useCapture);
    },
    unbindEvents() {
      this.type === this.gradType && window.removeEventListener('keyup', this.handleKeyup);
      this.unbindEventsDoc();
      this.closeOnClickBody && window.removeEventListener('mousedown', this.handleClosePicker);
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
      this.$emit('input', false);
      this.$emit('onClose');
      this.removeEventListener();
      this.unbindEvents();
      this.unbindEventsDoc();
    },
    handleClearColor() {
      this.handleClosePicker();
      this.changeColor({
        colors: [],
        style: {},
        deg: 0,
        color: '',
        rgba: {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        },
        hex: ''
      });
    },
    handleKeyup(e) {
      console.log('keyup');

      if ([8, 46].includes(e.keyCode)) {
        this.deleteColorPot();
      }
    },
    deleteColorPot() {
      // 渐变色至少有两点
      if (this.colors.length === 2) return;
      this.colors.splice(this.selectIndex, 1);

      // 删完滑块需要重新渲染
      this.initColors();
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
      if (this.type === 'linear') {
        const colorValue = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
        this.color = {
          rgba,
          hex,
          color: colorValue
        };
        this.emitColorChange({
          color: cloneDeep(this.color)
        });
      } else {
        this.handleGradientColorChange(color);
      }
    },
    emitColorChange({
      style,
      colors = cloneDeep(this.colors),
      color = cloneDeep(this.color),
      deg = this.deg
    }) {
      this.$emit('changeColor', {
        style,
        colors,
        color,
        deg
      });
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
    warn(msg) {
      this.$nextTick(() => {
        console.error(msg);
      });
    },
    handleClickPicker() {
      this.showSelectColor = !this.showSelectColor;
      if (this.showSelectColor) {
        setTimeout(() => {
          this.addEventListener();
          this.bindEvents();
        }, 0);
      } else {
        this.removeEventListener();
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
    },
    findEle() {}
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
