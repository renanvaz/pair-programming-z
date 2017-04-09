'use babel';

export default class Cursor {
  constructor(user, point) {
    this.user   = user;
    this.point  = point;
    this.marker = this.user.editor.markBufferPosition(this.point, {invalidate: 'never'});

    let fontSize        = atom.config.get('editor.fontSize');
    let lineHeight      = atom.config.get('editor.lineHeight');

    let cursorHeight    = Math.floor(fontSize * lineHeight);
    let top             = -Math.floor(fontSize * lineHeight);

    this.$el            = document.createElement('div');
    this.$el.classList.add('pair-programming-z_cursor-wrapper');
    this.$el.style.marginTop  = `${top}px`;
    this.$el.innerHTML  =
    `
    <div class="pair-programming-z_cursor ${this.user.color} blink" style="height: ${cursorHeight}px;"></div>
    <div class="pair-programming-z_name ${this.user.color}">${this.user.name}</div>
    `;

    this.$el.addEventListener('mouseover', function() {
      this.querySelector('.pair-programming-z_name').style.display = 'inline-block';
    });

    this.$el.addEventListener('mouseout', function() {
      this.querySelector('.pair-programming-z_name').style.display = 'none';
    });

    this.user.editor.decorateMarker(this.marker, { type: 'overlay', item: this.$el });
  }

  destroy() {
    this.$el.remove();
    this.marker.destroy();
  }

  redraw() {
    this.marker.destroy();
    this.marker = this.user.editor.markBufferPosition(this.point, { invalidate: 'never' });
    this.user.editor.decorateMarker(this.marker, { type: 'overlay', item: this.$el });
  }
}
