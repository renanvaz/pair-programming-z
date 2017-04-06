'use babel';

import Peer from 'peerjs';
import PairStatusView from './PairStatusView';
import Cursor from './Cursor';
import Server from './Server';
import Color from './Color';
import { Emitter } from 'atom';

export default class EditorServer {
  constructor(editor) {
    this.editor   = editor;
    this.users    = {};
    this.cursor   = {};
    this.emitter  = new Emitter;
    this.conn     = new Server();

    let waitForTriggerChange = 0;
    let buffer    = this.editor.getBuffer();
    let grammar   = this.editor.getGrammar();

    this.conn.onDidOpen((id) => {
      this.emitter.emit('open', id);
    });

    this.conn.onDidConnection((client) => {
      this.users[client.id] = new User(client);

      client.send({
        event: 'status',
        data: {
          scopeName:  grammar.scopeName,
          filename:   this.editor.getTitle(),
          text:       this.editor.getText(),
          clients:    this.conn.getClientsInfo(client),
        },
      });
    });

    this.conn.onDidDisconnection((client) => {
      delete this.users[client.id];

      this.conn.send({
        type: 'disconnection',
        data: client.id,
      });
    });

    this.conn.onDidData((payload) => {
      console.log('client: data', payload);

      switch(payload.event) {
        case 'change':
          waitForTriggerChange = 2;
          buffer.delete(payload.data.delete);
          buffer.insert(payload.data.insert.at, payload.data.insert.text);
        break;
        case 'cursor':
          this.users[payload.signature]

          for (let signature in this.users) {
            if (signature == payload.signature) {
              this.users[signature].destroyAllCursors();

              for (let point of payload.data) {
                this.users[signature].addCursor(point);
              }
            } else {
              this.users[signature].redrawAllCrusors();
            }
          }
        break;
      }
    });

    buffer.onDidChange((event) => {
      if (waitForTriggerChange < 1) {
        this.conn.send({
          event: 'change',
          data: {
            delete: [
              [event.oldRange.start.row, event.oldRange.start.column],
              [event.oldRange.end.row, event.oldRange.end.column],
            ],
            insert: {
              at: [event.newRange.start.row, event.newRange.start.column],
              text: event.newText,
            }
          }
        });
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

    this.editor.onDidDestroy(() => {
      this.destroy();
    });
  }

  destroy() {
    console.log('Server editor destroied');
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
