export class ShadowCommandHelper{
    static install() {
        CONFIG.TextEditor.enrichers.push({ pattern: /\[\[(\/srr\s)(.*?)([\]]{2,3})(?:{([^}]+)})?/gi, enricher: this.#enrichRollCommand});
    
        //console.log("ShadowCommandHelper: installed");
        //console.log(CONFIG.TextEditor.enrichers);
        //this.#activateListeners($('body'));
      }

      static #activateListeners(html) {

      }

      static #enrichRollCommand(match, options) {
        //console.log("ShadowCommandHelper: enrichRollCommand");
        const formel = match[2];
        const t = formel.split('#', 2).map(p => p.trim());
        const num_dices = t[0];
        const label = "<strong>"+t[1]+"("+num_dices+")</strong>";
        const label_raw = t[1]+"("+num_dices+")";

        const a = document.createElement('a');
        a.classList.add('rolldialog');
        a.dataset.roll = num_dices;
        a.dataset.label = label_raw;
        a.innerHTML = label;
        return a;
      }
}