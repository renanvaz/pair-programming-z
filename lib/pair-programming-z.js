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
    this.pairProgrammingZView = new PairProgrammingZView(state.pairProgrammingZViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.pairProgrammingZView.getElement(),
    //   visible: false
    // });

    this.peer = new Peer({key: 'qs7hwii89g2satt9'}); // Deixar a Key ser cadastrada

    this.peer.on('open', (id) => {
        this.id = id;
        this.pairProgrammingZView.getStatusBarElement().innerHtml = id;
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pair-programming-z:server': () => this.server(),
      'pair-programming-z:client': () => this.client(),
    }));
  },

  deactivate() {
    this.statusBarTile.destroy();
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.pairProgrammingZView.destroy();
  },

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addLeftTile({item: this.pairProgrammingZView.getStatusBarElement(), priority: 100});
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
