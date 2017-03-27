'use babel';

import {CompositeDisposable} from 'atom';

export default {
  $el: null,
  subscriptions: null,

  create() {
    this.$el = document.createElement('a');
    this.$el.classList.add('inline-block');

    this.subscriptions  = new CompositeDisposable();
    this.subscriptions.add(atom.tooltips.add(this.$el, {title: 'Copiar para o clipboard'}));

    this.$el.addEventListener('click', () => {
      atom.clipboard.write(this.$el.innerHTML);
      atom.notifications.addSuccess('Server ID copiado para o clipboard com sucesso!', {dimissable: true});
    });

    this.set('');
  },

  destroy() {
    this.$el.remove();
  },

  set(value) {
    this.$el.innerHTML = value;
  }
}
