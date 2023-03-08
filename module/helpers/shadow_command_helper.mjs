export class ShadowCommandHelper{
    static install() {
        CONFIG.TextEditor.enrichers.push({ pattern: /\[\[(\/srr\s)(.*?)([\]]{2,3})(?:{([^}]+)})?/gi, enricher: this.#enrichRollCommand});
    
        this.#activateListeners($('body'));
      }

      static #activateListeners(html) {

      }

      static #enrichRollCommand(match, options) {}
}