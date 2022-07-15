<template>
  <div class="color_picker_wrapper" ref="refBox" v-show="value">
    <div class="color_picker_box" @mousedown.stop>
      <div class="color_hd" :class="!(showClose||titleConfig.show)&&!titleConfig.text?'color_hd_0':''">
        <div class="title" v-if="titleConfig.show!==false">
          <span :style="titleConfig.style || {}">{{ titleConfig.text }}</span>
          <span v-if="showClose" class="close_box" @click="handleClosePicker"
            >x</span
          >
        </div>
        <div class="gcolor"  v-if="type === 'gradient'">
          <div class="gcolor_deg" v-if="!disabledColorDeg">
            <div class="gcolor_deg_span">角度</div>
            <Slider v-model="deg" :min="0" :max="360" :show-tooltip="false" />
            <input class="number_input" v-model="deg" />
          </div>

          <div class="gcolor_bar" ref="refColorBar">
            <div
              class="gcolor_bar_bg"
              :style="`background:${barStyle}`"
              @click="handlePotBar"
            ></div>
            <div class="gcolor_bar_pot_box">
              <div
                class="gcolor_bar_pot"
                v-for="(item, index) in colors"
                :key="`${item.pst}_${index}`"
                :style="{
                  left: getBarPst(item.pst),
                }"
                :class="{
                  on: selectIndex === index,
                }"
                @mousedown="sliderPotDown(index,$event)"
                @click="clickGColorPot(index)"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="gradient_box" v-if="type === 'gradient'">
        <template v-for="(item, index) in colors">
          <SketchColorPicker
            :key="`${item.pst}_${index}`"
            v-if="index === selectIndex"
            theme="light"
            :value="item.color"
            :sucker-hide="true"
            @input="changeColor"
          />
        </template>
      </div>

      <div class="linear" v-else>
        <SketchColorPicker
          theme="light"
          :value="color.color"
          :sucker-hide="true"
          @input="changeColor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ColorScale from 'color-scales'
import { cloneDeep ,keepDecimal} from '../utils/index'
import Slider from 'element-ui/lib/slider'
import { Sketch } from 'vue-color'
import 'element-ui/lib/theme-chalk/slider.css'
const doc = document.body
let isSelectBoxMouseDown = false

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
    Slider,
  },
  props: {
    value: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'linear',
    },
    disabledColorDeg: {
      type: Boolean,
      default: false,
    },
    pDeg: {
      type: Number,
      default: 90,
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
          color: 'rgba(0,0,0,1)',
        }
      },
    },
    pColors: {
      type: Array,
      default() {
        return [
          {
            color: 'rgba(255, 255, 255, 1)',
            hex: '#ffffff',
            rgba: { r: 255, g: 255, b: 255, a: 1 },
            pst: 100,
          },
          {
            color: 'rgba(0, 0, 0, 1)',
            hex: '#000000',
            rgba: { r: 0, g: 0, b: 0, a: 1 },
            pst: 0,
          },
        ]
      },
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    closeOnClickBody: {
      type: Boolean,
      default: false,
    },
    titleConfig: {
      type: Object,
      default() {
        return {
          show: true,
          text: '颜色选择器',
          style: {},
        }
      },
    },
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
        color: 'rgba(0,0,0,1)',
      },
      deg: 0,
      colors: [],
      selectIndex: 0,
      startMovePst: 0,
      //
      mouseStartPst: {x:0,y:0},
      movePst: {
        x: 0,
        y: 0,
      },
      pageX: 0,
      pageY: 0,
    }
  },
  created() {
    this.deg = this.pDeg
    this.colors = this.pColors
    if(typeof this.pColor === 'string'){
      this.pColor.indexOf("#")!==-1?(this.color.hex = this.pColor):(this.color.color = this.pColor)
    }else{
      this.color = this.pColor
    }
    if(this.pColors.length<2){
      this.warn("The pColors default length cannot be less than 2")
    }
  },
  computed: {
    barStyle() {
      if (!this.colors) {
        return ''
      }
      const colors = cloneDeep(this.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return `${item.color} ${keepDecimal(String(item.pst)||'',5)}%`
        })
      return `linear-gradient(${this.deg}deg, ${colors.join(
        ','
      )});`
    },
  },
  mounted() {
    this.initColors()
  },
  methods: {
    initColors() {
      // 初始化颜色值
      if (this.type === 'gradient') {
        const renderList = cloneDeep(this.colors).sort((a, b) => a.pst - b.pst)
        this.selectIndex = this.colors.findIndex(
          (item) => item.pst === renderList[0].pst
        )

        this.$nextTick(() => {
          this.emitColorChange({
            style: this.barStyle,
          })
        })
      } else {
        this.emitColorChange({
          color: cloneDeep(this.color),
        })
      }
    },
    bindEvents() {
      this.type === 'gradient' &&
        window.addEventListener('keyup', this.handleKeyup)
      if (this.closeOnClickBody) {
        window.addEventListener('mousedown', this.handleClosePicker)
      }
    },
    bindEventsDoc(useCapture = false) {
      doc.addEventListener('mousemove', this.handleEleMouseMove, useCapture)
      doc.addEventListener('mouseup', this.handleEleMouseUp, useCapture)
    },
    unbindEvents() {
      this.type === 'gradient' &&
      window.removeEventListener('keyup', this.handleKeyup)
      this.unbindEventsDoc()
      this.closeOnClickBody &&
        window.removeEventListener('mousedown', this.handleClosePicker)
    },
    unbindEventsDoc(useCapture = false) {
      doc.removeEventListener('mousemove', this.handleEleMouseMove, useCapture)
      doc.removeEventListener('mouseup', this.handleEleMouseUp, useCapture)
    },
    handleEleMouseMove(e) {
      if (!isSelectBoxMouseDown) return
      this.movePst.x = e.pageX - this.mouseStartPst.x
      this.movePst.y = e.pageY - this.mouseStartPst.y
      this.pageX = e.pageX
      this.pageY = e.pageY
      this.sliderMove(e)
    },
    handleEleMouseUp(e) {
      isSelectBoxMouseDown = false
      this.sliderDone(e)
    },
    resetDraggle() {
      isSelectBoxMouseDown = false
      this.mouseStartPst = {x:0,y:0}
      this.movePst.x = 0
      this.movePst.y = 0
      this.unbindEventsDoc()
    },
    handleClosePicker() {
      this.$emit('input', false)
      this.$emit('onClose')
    },
    handleKeyup(e) {
      if ([8, 46].includes(e.keyCode)) {
        this.deleteColorPot()
      }
    },
    deleteColorPot() {
      // 渐变色至少有两点
      if (this.colors.length === 2) return
      this.colors.splice(this.selectIndex, 1)

      // 删完滑块需要重新渲染
      this.initColors()
    },
    handlePotBar(e) {
      const barBounding = this.$refs.refColorBar.getBoundingClientRect()
      const barLeft = barBounding.left
      const colorPotDist = e.pageX - barLeft
      // 渐变条stopColors
      const rangColors = cloneDeep(this.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return item.hex
        })

      // 初始化色条Range，用来取渐变色值
      const colorScale = new ColorScale(0, barBounding.width, rangColors)
      const colorPotHex = colorScale.getColor(colorPotDist).toHexString()
      const colorPotRgba = colorScale.getColor(colorPotDist).toRGBAString()
      const colorPotPst = (100 * colorPotDist) / barBounding.width

      this.colors.push({
        color: colorPotRgba,
        rgba: colorPotRgba,
        hex: colorPotHex,
        pst: colorPotPst,
      })

      // 增加后默认选中
      this.selectIndex = this.colors.length - 1
    },
    sliderPotDown(index,$event) {
      this.bindEventsDoc()
      const e = $event
      this.clickGColorPot(index)
      isSelectBoxMouseDown = true
      this.mouseStartPst.x = e.pageX
      this.mouseStartPst.y = e.pageY
      this.sliderStart(e)
    },
    sliderStart() {
      this.startMovePst = this.colors[this.selectIndex].pst
    },
    sliderMove() {
      const barWidth = this.$refs.refColorBar?.getBoundingClientRect().width
      let distRatio =
        ((this.startMovePst * barWidth) / 100 + this.movePst.x) / barWidth
      if (distRatio > 1) {
        distRatio = 1
      } else if (distRatio < 0) {
        distRatio = 0
      }
      this.colors[this.selectIndex].pst = Math.round(distRatio * 100)
    },
    sliderDone() {
      this.resetDraggle()
    },
    getBarPst(pst) {
      return `calc(${pst}% - 8px)`
    },
    changeColor(color) {
      const rgba = color.rgba
      const hex = color.hex
      if (this.type === 'linear') {
        const colorValue = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        this.color = {
          rgba,
          hex,
          color: colorValue,
        }
        this.emitColorChange({
          color: cloneDeep(this.color),
        })
      } else {
        this.handleGradientColorChange(color)
      }
    },
    emitColorChange({
      style,
      colors = cloneDeep(this.colors),
      color = cloneDeep(this.color),
      deg = this.deg,
    }) {
      this.$emit('changeColor', {
        style,
        colors,
        color,
        deg,
      })
    },
    handleGradientColorChange(color) {
      const rgba = color.rgba
      this.colors[
        this.selectIndex
      ].color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
      this.colors[this.selectIndex].hex = color.hex
      this.colors[this.selectIndex].rgba = color.rgba
    },
    clickGColorPot(index) {
      if (this.selectIndex === index) return
      this.selectIndex = index
    },
    warn(msg){
      this.$nextTick(()=>{
        console.error(msg)
      })
    }
  },
  watch: {
    value: {
      handler(visible) {
        if (!visible) {
          this.unbindEvents()
          this.unbindEventsDoc()
        } else {
          this.bindEvents()
        }
      },
      deep: true,
    },
    barStyle: {
      handler(barStyle) {
        if (this.type === 'linear') return
        this.emitColorChange({
          style: barStyle,
        })
      },
      deep: true,
    },
    pColor: {
      handler(pColor) {
        this.color = cloneDeep(pColor)
      },
      deep: true,
    },
    pColors: {
      handler(pColors) {
        if (this.selectIndex >= pColors.length) {
          this.selectIndex = pColors.length - 1
        }
        this.colors = cloneDeep(pColors)
      },
      deep: true,
    },
    deg: {
      handler(newDeg) {
        const deg = Number(parseInt(newDeg))||0
        if(deg>360){
          this.deg = 360
        }else if(deg<0){
          this.deg = 0
        }else{
          this.deg = deg
        }
      },
    }
  },
  destroyed() {
    this.unbindEvents()
    this.unbindEventsDoc()
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.color_picker_wrapper {
  width: 240px;
  .color_picker_box {
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    background: #f7f8f9;
    padding: 15px 10px;
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

    .color_hd_0{
      margin-bottom: 0;
    }
    .title {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      padding-left: 4px;
      color: #606266;
      .close_box {
        speak: none;
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
</style>
