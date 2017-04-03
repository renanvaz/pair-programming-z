'use babel';

import Peer from 'peerjs';
import PairStatusView from './PairStatusView';
import Cursor from './Cursor';
import Client from './Client';
import { Emitter } from 'atom';

export default class EditorClient {
  constructor(editor, serverId) {
    this.serverId     = serverId;
    this.editor       = editor;
    this.cursor       = {};
    this.emitter      = new Emitter;
    this.conn         = new Client(this.serverId);
    this.filename     = 'Connecting...';

    this.editor.getTitle = () => this.filename;
    this.editor.getLongTitle = () => this.filename;

    let waitForTriggerChange = 0;
    let buffer = editor.getBuffer();

    this.editor.onDidDestroy(() => {
      this.destroy();
    });

    this.conn.onDidOpen((id) => {
      console.log('open');

      buffer.onDidChange((event) => {
        if (waitForTriggerChange < 1) {
          this.conn.send({event: 'change', data: {delete: [[event.oldRange.start.row, event.oldRange.start.column], [event.oldRange.end.row, event.oldRange.end.column]], insert: {at: [event.newRange.start.row, event.newRange.start.column], text: event.newText}}});
        } else {
          waitForTriggerChange--;
        }
      });

      this.editor.onDidChangeCursorPosition((event) => {
        let cursors = editor.getCursorScreenPositions();

        this.conn.send({
          event: 'cursor',
          data: cursors.map(v => v.toArray())
        });
      });

      this.emitter.emit('open', id);
    });

    this.conn.onDidData((payload) => {
      console.log(payload);

      switch(payload.event) {
        case 'start':
          waitForTriggerChange = 1;
          editor.setGrammar(atom.grammars.grammarForScopeName(payload.data.scopeName))
          editor.setText(payload.data.text);
        break;
        case 'change':
          waitForTriggerChange = 2;
          buffer.delete(payload.data.delete);
          buffer.insert(payload.data.insert.at, payload.data.insert.text);
        break;
        case 'cursor':
          if (typeof this.cursor[payload.signature] == 'undefined') this.cursor[payload.signature] = [];

          for (let cursor of this.cursor[payload.signature]) {
            cursor.destroy();
          }

          for (let point of payload.data) {
            cursor = new Cursor(editor, point);
            this.cursor[payload.signature].push(cursor);
          }
        break;
      }
    });
  }

  destroy() {
    console.log('destroy');
    this.conn.destroy();
    this.emitter.emit('destroy');
  }

  onDidOpen(fn) {
    this.emitter.on('open', fn);
  }

  onDidDestroy(fn) {
    this.emitter.on('destroy', fn);
  }
}
