'use babel';

import PairProgrammingZView from './pair-programming-z-view';
import { CompositeDisposable } from 'atom';
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
    this.pairProgrammingZView = new PairProgrammingZView(state.pairProgrammingZViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.pairProgrammingZView.getElement(),
    //   visible: false
    // });

    let statusBarEl = this.pairProgrammingZView.getStatusBarElement();

    this.peer = new Peer({key: 'qs7hwii89g2satt9'}); // Deixar a Key ser cadastrada
    this.peer.on('open', (id) => {
        this.id = id;
        statusBarEl.innerHTML = id;
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
    this.pairProgrammingZView.destroy();
  },

  consumeStatusBar(statusBar) {
    console.log('consumeStatusBar');
    this.statusBarTile = statusBar.addLeftTile({item: this.pairProgrammingZView.getStatusBarElement(), priority: 0});
  },

  serialize() {
    return {
      pairProgrammingZViewState: this.pairProgrammingZView.serialize()
    };
  },

  server() {
    console.log('PairProgrammingZ server!');
  },

  client() {
    console.log('PairProgrammingZ client!');
  }
};
