'use babel';

import Peer from 'peerjs';
import {Emitter} from 'atom';

export default class Client {
  constructor(serverId) {
    this.serverId     = serverId;
    this.emitter      = new Emitter;
    this.peer         = new Peer({key: 'qs7hwii89g2satt9'});

    this.peer.on('open', (id) => {
      console.log('client: open', id);

      this.conn = this.peer.connect(this.serverId);

      this.conn.on('open', () => {
        console.log('client: conn open');

        this.emitter.emit('open', id);
      });

      this.conn.on('data', (payload) => {
        console.log('client: conn data');

        this.emitter.emit('data', payload);
      });

      this.conn.on('disconnected', () => {
        console.log('client: conn disconnected');

        this.emitter.emit('disconnected', {conn: this.conn});
      });

      this.conn.on('error', (err) => {
        console.log('client: conn error', err);
      });
    });

    this.peer.on('error', (err) => {
      console.log('client: error', err);
    });
  }

  send(data) {
    this.conn.send(data);
  }

  destroy() {
    this.peer.disconnect();
    this.peer.destroy();
    this.emitter.emit('destroy');
  }

  onDidOpen(fn) {
    this.emitter.on('open', fn);
  }

  onDidData(fn) {
    this.emitter.on('data', fn);
  }

  onDidDestroy(fn) {
    this.emitter.on('destroy', fn);
  }

  get id() {
    return this.peer.id;
  }
}
