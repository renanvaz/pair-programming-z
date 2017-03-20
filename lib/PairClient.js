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

    atom.notifications.addInfo(`Conecting to the server "${id}"...`, {dismissable: false});
    // PairStatusView.set(id);

    var conn = this.peer.connect(id);
    conn.on('open', function(){
      console.log('connected');

      atom.notifications.addSuccess(`Connected to the server "${id}"!`, {dismissable: false});
    });

    conn.on('disconnected', () => {
      console.log('disconnected');
      atom.notifications.addInfo(`Disconnected from server "${id}"!`, {dismissable: false});
    });

    conn.on('error', () => {
      console.log('error');
      atom.notifications.addInfo(`Error on connecting to server "${id}"!`, {dismissable: false});
    });

    conn.on('data', function(data){
        console.log('data');
        this.editor.insertText(data);
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
