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

    atom.notifications.addInfo(`Criando um novo servidor para o arquivo "${this.editor.getTitle()}"`, {dimissable: true});

    this.peer.on('open', (id) => {
      atom.notifications.addSuccess(`O ID para conexão do arquivo "${this.editor.getTitle()} é: ${id}"`, {dimissable: true});

      if (atom.workspace.getActiveTextEditor() == this.editor) {
        PairStatusView.set(id);
      }
    });

    this.peer.on('connection', (conn) => {
      console.log('connection');

      this.connections.push(conn);

      conn.on('data', (data) => {
          console.log('data');

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
