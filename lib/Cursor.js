'use babel';

export default class Cursor {
  constructor(editor, point, color, name = 'Name') {
    this.editor = editor;
    this.point  = point;
    this.color  = color;
    this.name   = name;

    let fontSize        = atom.config.get('editor.fontSize');
    let lineHeight      = atom.config.get('editor.lineHeight');

    let cursorHeight    = Math.floor(fontSize * lineHeight);
    let top             = -Math.floor(fontSize * lineHeight);

    this.$el            = document.createElement('div');
    this.$el.innerHTML  =
    `
    <div class="pair-programming-z_cursor blink" style="height: ${cursorHeight}px; background-color: ${this.color};"></div>
    <div class="pair-programming-z_name" style="background-color: ${this.color};">${this.name}</div>
    `;
    this.$el.style.position = 'relative';
    this.$el.style.padding  = '0 5px';
    this.$el.style.left     = '-5px';
    this.$el.style.top      = `${top}px`;

    this.$el.addEventListener('mouseover', function() {
      this.querySelector('.pair-programming-z_name').style.display = 'inline-block';
    });

    this.$el.addEventListener('mouseout', function() {
      this.querySelector('.pair-programming-z_name').style.display = 'none';
    });

    this.marker = this.editor.markBufferPosition(this.point, {invalidate: 'never'});
    this.editor.decorateMarker(this.marker, {type: 'overlay', item: this.$el});
  }

  destroy() {
    this.$el.remove();
    this.marker.destroy();
  }

  redraw() {
    this.marker.destroy();
    this.marker = this.editor.markBufferPosition(this.point, {invalidate: 'never'});
    this.editor.decorateMarker(this.marker, {type: 'overlay', item: this.$el});
  }
}
