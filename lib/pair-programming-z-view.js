'use babel';

export default class PairProgrammingZView {

  constructor(serializedState) {
    this.statusBarElement = document.createElement('span');
    this.statusBarElement.innerHtml = "Teste";
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.statusBarElement.remove();
  }

  getStatusBarElement() {
    return this.statusBarElement;
  }

}
