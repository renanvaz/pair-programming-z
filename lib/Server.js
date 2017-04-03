'use babel';

import Peer from 'peerjs';
import {Emitter} from 'atom';

export default class Server {
  constructor(editor) {
    this.emitter      = new Emitter;
    this.peer         = new Peer({key: 'qs7hwii89g2satt9'});
    this.connections  = [];

    this.peer.on('open', (id) => {
      console.log('server: open', id);

      this.emitter.emit('open', id);
    });

    this.peer.on('error', (err) => {
      console.log('server: error', err);
    });

    this.peer.on('connection', (client) => {
      console.log('server: connection');

      this.connections.push(client);

      client.on('open', (id) => {
        console.log('server: client open');

        this.emitter.emit('connection', client);
      });

      client.on('data', (payload) => {
        console.log('server: client data');

        for (let other of this.connections) {
          if (other !== client) {
            otherConn.send(data);
          }
        }

        this.emitter.emit('data', payload);
      });

      client.on('disconnected', () => {
        console.log('server: client disconnected');

        this.emitter.emit('disconnection', client);
      });

      client.on('error', (err) => {
        console.log('server: client error', err);
      });
    });
  }

  send(data) {
    data.signature = this.peer.id;

    for (let conn of this.connections) {
      conn.send(data);
    }
  }

  destroy() {
    this.peer.destroy();
    this.emitter.emit('destroy');
  }

  onDidOpen(fn) {
    this.emitter.on('open', fn);
  }

  onDidConnection(fn) {
    this.emitter.on('connection', fn);
  }

  onDidDisconnection(fn) {
    this.emitter.on('disconnection', fn);
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
