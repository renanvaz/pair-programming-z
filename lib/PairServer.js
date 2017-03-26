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

    atom.notifications.addInfo(`Creating a new server for the file "${this.editor.getTitle()}"`, {dismissable: false});

    this.peer.on('open', (id) => {
      atom.notifications.addSuccess(`The server connection ID for the file "${this.editor.getTitle()} is: ${id}`, {dismissable: false});

      if (atom.workspace.getActiveTextEditor() == this.editor) {
        PairStatusView.set(id);
      }
    });

    this.peer.on('connection', (conn) => {
      console.log('connection');

      let text = editor.getText();
      let grammar = editor.getGrammar();

      this.connections.push(conn);

      conn.on('open', () => {
        conn.send({event: 'start', data: {scopeName: grammar.scopeName, text: text}});
      });

      conn.on('data', (payload) => {
        console.log('data');

        switch(payload.event) {
          case 'text':
            editor.setText(payload.data);
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

    let buffer = editor.getBuffer();

    buffer.onDidChange((event) => {
      console.log(event);

      for (let conn of this.connections) {
        conn.send({event: 'change', data: {delete: [[event.oldRange.start.row, event.oldRange.start.column], [event.oldRange.end.row, event.oldRange.end.column]], insert: {at: [event.newRange.start.row, event.newRange.start.column], text: event.newText}}});
      }
    });

    // editor.onDidChangeCursorPosition((event) => {
    //   console.log(event);
    //   if (event.textChanged) {
    //     let text = editor.getText();
    //
    //     for (let conn of this.connections) {
    //       conn.send({event: 'text', data: text});
    //     }
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
