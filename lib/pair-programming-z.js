'use babel';

import EditorServer from './EditorServer';
import EditorClient from './EditorClient';
import PairStatusView from './PairStatusView';
import { CompositeDisposable } from 'atom';

export default {
  servers: [],
  clients: [],

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
            PairStatusView.set(server.conn.id);
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
          atom.notifications.addError(`A server already exists for the file "${server.editor.getTitle()}". Seu ID é: ${server.peer.id}`, {dismissable: false});
          return false;
        }
      }

      server = new EditorServer(editor);

      server.onDidOpen((id) => {
        atom.notifications.addSuccess(`The server connection ID for the file "${server.editor.getTitle()} is: ${id}`, {dismissable: false});

        if (atom.workspace.getActiveTextEditor() == this.editor) {
          PairStatusView.set(id);
        }
      });

      server.onDidDestroy(() => {
        // Remove from array
        for (let i = this.servers.length-1; i--;) {
          if (this.servers[i] === server) this.servers.splice(i, 1);
        }
      });

      this.servers.push(server);

      atom.notifications.addInfo(`Creating a new server for the file "${server.editor.getTitle()}"`, {dismissable: false});
    }
  },

  client() {
    console.log('PairProgrammingZ: client');

    let client;
    for (client of this.clients) {
      if (client.editor == editor) {
        atom.notifications.addInfo(`A client already exists for the server "${client.peer.id}"`, {dismissable: true});
        return false;
      }
    }

    let text =
    '<div class="form-group"> \
      <label for="pair-programming-z-server-id">Insert the server ID</label> \
      <input type="text" class="form-control" id="pair-programming-z_server-id" placeholder="Server ID"> \
    </div> \
    <div class="form-group"> \
      <label for="pair-programming-z-server-id">Insert your name</label> \
      <input type="text" class="form-control" id="pair-programming-z_client-name" placeholder="Your Name"> \
    </div>';

    let message = atom.notifications.addInfo(text, {
      dismissable: true,
      buttons: [
        {
          text: 'Start a pair programming',
          onDidClick: () => {
            let serverId = document.querySelector('#pair-programming-z_server-id').value;

            message.dismiss();

            atom.workspace.open().then((editor) => {
              client = new EditorClient(editor, serverId);

              client.onDidOpen((serverId) => {
                atom.notifications.addSuccess(`Connected to the server "${serverId}"!`, {dismissable: false});
              });

              client.onDidDestroy(() => {
                // Remove from array
                for (let i = this.clients.length-1; i--;) {
                  if (this.clients[i] === client) this.clients.splice(i, 1);
                }
              });

              this.clients.push(client);
            });
          }
        }
      ]
    });

    document.querySelector('#pair-programming-z_server-id').focus();
  }
};
