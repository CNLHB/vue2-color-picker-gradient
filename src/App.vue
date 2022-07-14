<template>
  <div id="app">
    <div class="select" @click="showPicker">选择器</div>
    <div class="color_poick">
      <ColorPicker
        v-model="isShowColorPicker"
        type="gradient"
        @changeColor="changeColor"
        @onClose="onClosePicker"
        :pDeg="90"
        :pColor="pColor"
        :pColors="pColors"            
        :showClose="true"
        :closeOnClickBody="false"
      />
    </div>
    <div class="box_xxx" :style="style"></div>
  </div>
</template>

<script>
import ColorPicker from './components/vue2-color-picker.vue'

export default {
  name: 'App',
  components: {
    ColorPicker,
  },
  data() {
    return {
      isShowColorPicker: false,
      color: {
        hex: '#000000',
        rgba: { r: 0, g: 0, b: 0, a: 1 },
        color: 'rgba(0,0,0,1)',
      },
      style: '',
      titleConfig:{

      },
      pDeg: 60,
      pColor:{
           hex: '#194d33',
          hex8: '#194d33',
          hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
          hsv: { h: 150, s: 0.66, v: 0.3, a: 1 },
          rgba: { r: 25, g: 77, b: 51, a: 1 },
          a: 1,
          color: 'rgba(0,0,0,1)',
      },
      pColors:[
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
      ],

    }
  },
  methods: {
    changeColor({ style, colors, deg, color }) {
      const obj = { type: 'color', value: color }
      console.log(style, colors, deg)
      console.log(obj)
      this.style = style
      // updateProps(obj)
    },
    showPicker(){
        this.isShowColorPicker=true
        console.log('1');
    },
    onClosePicker() {
      // this.isShowColorPicker && (this.isShowColorPicker = false)
    },
  },
  watch:{
    //  isShowColorPicker:{
    //   handler(isShowColorPicker){
    //       console.log(isShowColorPicker);
    //   },
    //   deep: true
    // },
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.select{
  height: 30px;
  width: 50px;
}
.box_xxx {
  width: 300px;
  height: 300px;
}

</style>
