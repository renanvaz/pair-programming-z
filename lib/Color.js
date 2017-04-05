'use babel';

let colors = [
  '#FCD0A1',
  '#DCD6F7',
  '#3CDBD3',
  '#B4869F',
  '#AFD2E9',
  '#188FA7',
  '#86E7B8',
  '#E396DF',
];

let index = 0;

export default {
  get() {
    return colors[index++%colors.length];
  }
}
