'use babel';

let index = 0;
let max = 8;

export default {
  get() {
    return 'pair-programming-z_color-'+(index++%max);
  }
}
