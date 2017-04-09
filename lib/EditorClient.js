'use babel';

import Peer from 'peerjs';
import PairStatusView from './PairStatusView';
import User from './User';
import Client from './Client';
import { Emitter } from 'atom';

export default class EditorClient {
  constructor(editor, serverId) {
    this.serverId     = serverId;
    this.editor       = editor;
    this.users        = {};
    this.emitter      = new Emitter;
    this.conn         = new Client(this.serverId);
    this.filename     = 'Connecting...';
    this.connections  = [];

    this.editor.getTitle = () => this.filename;
    this.editor.getLongTitle = () => this.filename;

    let waitForTriggerChange = 0;
    let buffer = editor.getBuffer();

    this.editor.onDidDestroy(() => {
      this.destroy();
    });

    this.conn.onDidOpen((id) => {
      this.conn.send({event: 'connection', data: 'Name'});

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
          data: cursors.map(v => v.serialize())
        });
      });

      this.editor.onDidChangeSelectionRange((event) => {
        let selecions = editor.getSelectedBufferRanges();

        this.conn.send({
          event: 'selection',
          data: selecions.map(v => v.serialize()),
        });
      });

      this.emitter.emit('open', id);
    });

    this.conn.onDidData((payload) => {
      console.log('server: data', payload);

      const user = this.users[payload.signature];

      switch(payload.event) {
        case 'connection':
          this.users[payload.signature] = new User(payload.signature, payload.data, this.editor);
        break;
        case 'status':
          waitForTriggerChange = 1;
          editor.setGrammar(atom.grammars.grammarForScopeName(payload.data.scopeName))
          editor.setText(payload.data.text);

          for (let user of payload.data.users) {
            this.users[user.signature] = new User(user.signature, user.name, this.editor);
          }

          console.log(this.users);
        break;
        case 'change':
          waitForTriggerChange = 2;
          buffer.delete(payload.data.delete);
          buffer.insert(payload.data.insert.at, payload.data.insert.text);
        break;
        case 'cursor':
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
        case 'selection':
          this.users[payload.signature].destroyAllSelections();

          for (let range of payload.data) {
            this.users[payload.signature].addSelection(range);
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
