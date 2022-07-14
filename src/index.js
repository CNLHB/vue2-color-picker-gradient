import ColorPickerGradient from './components/vue2-color-picker.vue';

/* istanbul ignore next */
ColorPickerGradient.install = function(Vue) {
  Vue.component(ColorPickerGradient.name, ColorPickerGradient);
};

export default ColorPickerGradient;