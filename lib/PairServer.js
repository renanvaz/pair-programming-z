'use babel';

import Peer from 'peerjs';
import PairStatusView from './PairStatusView';
import {Emitter} from 'atom';

export default class PairServer {
  constructor(editor) {
    this.emitter      = new Emitter;
    this.peer         = new Peer({key: 'qs7hwii89g2satt9'});
    this.editor       = editor;
    this.connections  = [];

    let waitForTriggerChange = 0;
    let buffer = editor.getBuffer();
    let grammar = editor.getGrammar();

    // console.log(grammar);

    atom.notifications.addInfo(`Creating a new server for the file "${this.editor.getTitle()}"`, {dismissable: false});

    this.peer.on('open', (id) => {
      atom.notifications.addSuccess(`The server connection ID for the file "${this.editor.getTitle()} is: ${id}`, {dismissable: false});

      if (atom.workspace.getActiveTextEditor() == this.editor) {
        PairStatusView.set(id);
      }
    });

    this.peer.on('connection', (conn) => {
      console.log('connection');

      this.connections.push(conn);

      conn.on('open', () => {
        conn.send({event: 'start', data: {scopeName: grammar.scopeName, text: editor.getText()}});
      });

      conn.on('data', (payload) => {
        console.log('data');

        switch(payload.event) {
          case 'change':
            waitForTriggerChange = 2;
            buffer.delete(payload.data.delete);
            buffer.insert(payload.data.insert.at, payload.data.insert.text);
          break;
        }

        for (let otherConn of this.connections) {
          if (otherConn !== conn) {
            otherConn.send(data);
          }
        }
      });

      conn.on('disconnected', () => {
        console.log('disconnected');
      });
    });

    editor.onDidDestroy(() => {
      this.destroy();
    });

    buffer.onDidChange((event) => {
      if (waitForTriggerChange < 1) {
        console.log('server', event);

        for (let conn of this.connections) {
          conn.send({event: 'change', data: {delete: [[event.oldRange.start.row, event.oldRange.start.column], [event.oldRange.end.row, event.oldRange.end.column]], insert: {at: [event.newRange.start.row, event.newRange.start.column], text: event.newText}}});
        }
      } else {
        waitForTriggerChange--;
      }
    });

    // editor.onDidChangeCursorPosition((event) => {
    //   console.log(event);
    //
    //   for (let conn of this.connections) {
    //     conn.send({event: 'cursor', data: [event.newBufferPosition.row, event.newBufferPosition.column]});
    //   }
    // });
  }

  destroy() {
    console.log('Server editor destroied');
    this.peer.destroy();
    this.emitter.emit('destroy');
  }

  onDidDestroy(fn) {
    this.emitter.on('destroy', fn);
  }
}
