'use babel';

export default class Cursor {
  constructor(editor, point) {
    console.log(point);

    let fontSize              = atom.config.get('editor.fontSize');
    let lineHeight            = atom.config.get('editor.lineHeight');

    this.$el                  = document.createElement('div');
    this.$el.style.width      = '2px';
    this.$el.style.height     = Math.floor(fontSize * lineHeight)+'px';
    this.$el.style.background = 'red';
    this.$el.style.position   = 'relative';
    this.$el.style.top        = -Math.floor(fontSize * lineHeight)+'px';

    this.$el.classList.add('blink');

    this.marker = editor.markBufferPosition(point, {invalidate: 'never'});
    editor.decorateMarker(this.marker, {type: 'overlay', item: this.$el});
  }

  destroy() {
    this.$el.remove();
    this.marker.destroy();
  }
}
