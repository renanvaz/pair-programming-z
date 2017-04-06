'use babel';

import Color from './Color';
import Cursor from './Cursor';

export default class User {
  constructor(id, name, editor) {
    this.editor     = editor;
    this.client     = client;
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
    this.selecions.push(new Selection(this, range));
  }

  destroyAllSelections() {
    for (let selecion of this.selecions) selecion.destroy();

    this.selecions = [];
  }

  redrawAllSelections() {
    for (let selecion of this.selecions) selecion.redraw();
  }
}
