'use babel';

import PairProgrammingZView from './pair-programming-z-view';
import {CompositeDisposable, TextEditor} from 'atom';
import Peer from 'peerjs';

export default {
  id: null,
  peer: null,
  conn: null,
  connections: [],

  pairProgrammingZView: null,
  statusBarTile: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('activate');
    this.view = new PairProgrammingZView(state.pairProgrammingZViewState);

    let statusBarEl = this.view.getStatusBarElement();

    atom.workspace.onDidChangeActivePaneItem((editor) => {
        if (editor instanceof TextEditor) {
            console.log(editor.getPath());
        }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pair-programming-z:server': () => this.server(),
      'pair-programming-z:client': () => this.client(),
    }));

    this.subscriptions.add(atom.tooltips.add(statusBarEl, {title: 'Copy to clipboard'}));

    statusBarEl.addEventListener('click', () => {
      atom.clipboard.write(this.id);
      atom.notifications.addSuccess('ID copiado para o clipboard com sucesso!', {dimissable: true});
    });
  },

  deactivate() {
    this.statusBarTile.destroy();
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  consumeStatusBar(statusBar) {
    console.log('consumeStatusBar');
    this.statusBarTile = statusBar.addLeftTile({item: this.view.getStatusBarElement(), priority: 0});
  },

  serialize() {
    return {
      pairProgrammingZViewState: this.view.serialize()
    };
  },

  server() {
    this.peer = new Peer({key: 'qs7hwii89g2satt9'}); // Deixar a Key ser cadastrada
    this.peer.on('open', (id) => {
      this.id = id;
      statusBarEl.innerHTML = id;
    });
  },

  client() {
    console.log('PairProgrammingZ client!');
  }
};
