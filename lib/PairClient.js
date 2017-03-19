'use babel';

import Peer from 'peerjs';
import PairStatusView from './PairStatusView';
import {Emitter} from 'atom';

export default class PairClient {
  constructor(editor, id) {
    this.emitter      = new Emitter;
    this.peer         = new Peer({key: 'qs7hwii89g2satt9'});
    this.editor       = editor;
    this.id           = id;

    atom.notifications.addInfo(`Conectando-se ao servidor "${id}"`, {dimissable: true});
    // PairStatusView.set(id);

    var conn = peer.connect(id);
    conn.on('open', function(){
      console.log('connected');
    });

    conn.on('data', function(data){
        console.log('data');
        document.querySelector('#test').value = data;
    });

    conn.on('disconnected', () => {
      console.log('disconnected');
    });

    editor.onDidDestroy(() => {
      this.destroy();
    });
  }

  destroy() {
    this.peer.destroy();

    this.emitter.emit('destroy');
  }

  onDidDestroy(fn) {
    this.emitter.on('destroy', fn);
  }
}
