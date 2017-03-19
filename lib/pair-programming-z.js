'use babel';

import PairServer from './PairServer';
import PairClient from './PairClient';
import PairStatusView from './PairStatusView';
import {CompositeDisposable} from 'atom';

export default {
  servers: [],
  clients: [],

  view: null,
  statusBarTile: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('activate', state);

    PairStatusView.create();

    this.subscriptions  = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pair-programming-z:server': () => this.server(),
      'pair-programming-z:client': () => this.client(),
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      console.log(item);

      if (atom.workspace.isTextEditor(item)) {
        for (let server of this.servers) {
          if (server.editor == item) {
            PairStatusView.set(server.peer.id);
          }
        }
      }
    }));
  },

  deactivate() {
    this.statusBarTile.destroy();
    this.subscriptions.dispose();
    PairStatusView.destroy();

    for (let server of this.servers) {
      server.destroy();
    }

    for (let client of this.clients) {
      client.destroy();
    }
  },

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addLeftTile({item: PairStatusView.$el, priority: 0});
  },

  server() {
    console.log('PairProgrammingZ: server');

    let editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      let server;
      for (server of this.servers) {
        if (server.editor == editor) {
          atom.notifications.addInfo(`Já existe um servidor para o arquivo "${server.editor.getTitle()}". Seu ID é: ${server.peer.id}`, {dimissable: true});
          return false;
        }
      }

      server = new PairServer(editor);

      server.onDidDestroy(() => {
        // Remove from array
        for (let i = this.servers.length-1; i--;) {
          if (this.servers[i] === server) this.servers.splice(i, 1);
        }
      });

      this.servers.push(server);
    }
  },

  client() {
    console.log('PairProgrammingZ: client');

    atom.workspace.open().then((editor) => {
      editor.insertText('Hello, World!');

      let client;
      for (client of this.clients) {
        if (client.editor == editor) {
          atom.notifications.addInfo(`Já existe um cliente para o servidor ${client.peer.id}`, {dimissable: true});
          return false;
        }
      }

      client = new PairClient(editor, id);

      client.onDidDestroy(() => {
        // Remove from array
        for (let i = this.clients.length-1; i--;) {
          if (this.clients[i] === client) this.clients.splice(i, 1);
        }
      });

      this.clients.push(server);
    });
  }
};
