'use babel';

export default class Selection {
  constructor(user, range) {
    this.user   = user;
    this.range  = range;

    this.marker = this.user.editor.markBufferRange(this.range, { invalidate: 'never' });
    this.user.editor.decorateMarker(this.marker, { type: 'highlight', class: `${this.user.color} pair-programming-z_overlay` });
  }

  destroy() {
    this.marker.destroy();
  }
}
