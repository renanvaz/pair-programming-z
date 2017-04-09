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
      console.log('server: connection', client.id);

      client.on('data', (payload) => {
        console.log('server: client data');

        if (payload.event == 'connection') {
          client.name = payload.data.name;
          this.connections.push(client);
          this.emitter.emit('connection', client);
        }

        payload.signature = client.id;

        for (let other of this.connections) {
          if (other !== client) {
            other.send(payload);
          }
        }

        this.emitter.emit('data', payload);
      });

      client.on('disconnected', () => {
        console.log('server: client disconnected');

        for (let i = this.connections.length-1; i--;) {
          if (this.connections[i] === client) this.connections.splice(i, 1);
        }

        this.emitter.emit('disconnection', client);
      });

      client.on('error', (err) => {
        console.log('server: client error', err);
      });
    });
  }

  send(data) {
    data.signature = this.peer.id;

    for (let client of this.connections) {
      client.send(data);
    }
  }

  destroy() {
    this.peer.disconnect();
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
