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

      this.connections.push(conn);

      conn.on('data', (data) => {
          console.log('data');

          this.editor.insertText(data);

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
