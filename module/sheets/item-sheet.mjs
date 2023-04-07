/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Shadowrun6ItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun6", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/shadowrun6-lw/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    context.actor = actor;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    
    
    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    this._preapreAttributesForSelect(context);
    this._prepareSkillsForSelect(context);
    const t_skills = [];
    for (let i of actor.items) {
      if (i.type === 'skill') {
        console.log(i);
        t_skills.push(i);
      }
    }

    context.char_skill_types = {A:{label: game.i18n.localize('SHADOWRUN6.Items.Skill.skill_types.long.attribute')},K:{label: game.i18n.localize('SHADOWRUN6.Items.Skill.skill_types.long.knowledge')}};
    
    return context;
  }

  _preapreAttributesForSelect(context){
    context.attribute_selection = [];
    let ignored_attributes = ["edge","matrix_initiative","astral_initiative","initiative","essence"];

    for (let [k, s_attr] of  Object.entries(context.actor.system.attributes)) {
      if(k.includes("_mod") || ignored_attributes.includes(k)) continue;

      let v = {}
      v.key = k;
      v.label = game.i18n.localize(CONFIG.SHADOWRUN6.attributes[k]) ?? k;
      v.helpTitle = game.i18n.localize("SHADOWRUN6.AttrHelpTitle."+ k) ?? k;
      v.attr_value = parseInt(s_attr.value);
      v.attr_mod_value = parseInt(context.actor.system.attributes[k+"_mod"].value);
      v.attr_total_value = v.attr_value + v.attr_mod_value;
      v.label_with_total_mod = v.label  + " (" + game.i18n.localize("SHADOWRUN6.Labels.DicePoolShort") + " " + v.attr_total_value + ")";
      context.attribute_selection.push(v);
    }
  }
  _prepareSkillsForSelect(context){
    context.skill_selection = []
      
    for(let skill of context.actor.items){
      if (skill.type === 'skill' && skill.system.skill_type == "A") {
        let t = {}
        console.log(skill);
        t.name = skill.name;
     
        t.name_with_total_mod = skill.name + " (" + game.i18n.localize("SHADOWRUN6.Labels.DicePoolShort") + " " + skill.system.skill_wp + ")";
        context.skill_selection.push(t);
      }
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
