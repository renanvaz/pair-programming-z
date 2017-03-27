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

    let waitForTriggerChange = 0;
    let buffer = editor.getBuffer();
    let conn = this.peer.connect(id);
    let marker;

    atom.notifications.addInfo(`Conecting to the server "${id}"...`, {dismissable: false});
    // PairStatusView.set(id);

    conn.on('open', function(){
      console.log('connected');

      atom.notifications.addSuccess(`Connected to the server "${id}"!`, {dismissable: false});
    });

    conn.on('data', function(payload){
      console.log('data');

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
          let fontSize = atom.config.get('editor.fontSize');
          let lineHeight = atom.config.get('editor.lineHeight');
          let el = document.createElement('div');
          el.style.width = '2px';
          el.style.height = Math.floor(fontSize * lineHeight)+'px';
          el.style.background = 'red';
          el.style.position = 'relative';
          el.style.top = -Math.floor(fontSize * lineHeight)+'px';

          if (marker) marker.destroy();

          marker = editor.markBufferPosition(payload.data, {invalidate: 'surround'});
          editor.decorateMarker(marker, {type: 'overlay', position: 'tail', item: el});

          console.log(marker);
        break;
      }
    });

    conn.on('disconnected', () => {
      console.log('disconnected');
    });

    editor.onDidDestroy(() => {
      this.destroy();
    });

    buffer.onDidChange((event) => {
      console.log('client', event);
      if (waitForTriggerChange < 1) {
        conn.send({event: 'change', data: {delete: [[event.oldRange.start.row, event.oldRange.start.column], [event.oldRange.end.row, event.oldRange.end.column]], insert: {at: [event.newRange.start.row, event.newRange.start.column], text: event.newText}}});
      } else {
        waitForTriggerChange--;
      }
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
