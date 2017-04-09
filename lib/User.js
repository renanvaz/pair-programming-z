'use babel';

import Color from './Color';
import Cursor from './Cursor';
import Selection from './Selection';

export default class User {
  constructor(id, name, editor) {
    this.editor     = editor;
    this.id         = id;
    this.name       = name;
    this.color      = Color.get();
    this.cursors    = [];
    this.selections = [];
  }

  addCursor(point) {
    this.cursors.push(new Cursor(this, point));
  }

  destroyAllCursors() {
    for (let cursor of this.cursors) cursor.destroy();

    this.cursors = [];
  }

  redrawAllCrusors() {
    for (let cursor of this.cursors) cursor.redraw();
  }

  addSelection(range) {
    this.selections.push(new Selection(this, range));
  }

  destroyAllSelections() {
    for (let selecion of this.selections) selecion.destroy();

    this.selections = [];
  }
}
