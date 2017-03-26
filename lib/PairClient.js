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

    let buffer = editor.getBuffer();
    let conn = this.peer.connect(id);

    atom.notifications.addInfo(`Conecting to the server "${id}"...`, {dismissable: false});
    // PairStatusView.set(id);

    conn.on('open', function(){
      console.log('connected');

      atom.notifications.addSuccess(`Connected to the server "${id}"!`, {dismissable: false});
    });

    conn.on('data', function(payload){
      console.log('data', payload);

      switch(payload.event) {
        case 'start':
          editor.setGrammar(atom.grammars.grammarForScopeName(payload.data.scopeName))
          editor.setText(payload.data.text);
        break;
        case 'change':
          buffer.delete(payload.data.delete);
          buffer.insert(payload.data.insert.at, payload.data.insert.text);
        break;
      }
    });

    conn.on('disconnected', () => {
      console.log('disconnected');
    });

    editor.onDidDestroy(() => {
      this.destroy();
    });
  }

  destroy() {
    console.log('destroy');
    this.peer.destroy();

    this.emitter.emit('destroy');
  }

  onDidDestroy(fn) {
    this.emitter.on('destroy', fn);
  }
}
