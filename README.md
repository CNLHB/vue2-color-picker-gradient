# vue2-color-picker-gradient

Color Pickers for Sketch, Photoshop, Chrome & more with Vue.js(vue2.0).

## [Live demo]()

## Installation

### ES6

```vue
<template>
  <div id="app">
    <div class="select" @click="showPicker">选择器</div>
    <div class="color_poick">
      <ColorPicker
        v-model="isShowColorPicker"
        type="linear"
        @changeColor="changeColor"
        @onClose="onClosePicker"
        :pDeg="90"
        :pColor="pColor"
        :pColors="pColors"            
        :showClose="true"
        :closeOnClickBody="false"
      />
       <ColorPicker
        v-model="isShowColorPicker1"
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
  
import ColorPicker from 'vue2-color-picker-gradient'

export default {
  name: 'App',
  components: {
    ColorPicker,
  },
  data() {
    return {
      isShowColorPicker: false,
      isShowColorPicker1: true,
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
      console.log(style, colors, deg,color)
      console.log(obj)
      this.style = style
    },
    showPicker(){
        this.isShowColorPicker=true
    },
    onClosePicker() {
     
    },
  },

}
</script>



```





## Local setup

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn lib
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
