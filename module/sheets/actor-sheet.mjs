import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {showSR6RollDialog} from "../helpers/roller.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Shadowrun6ActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["shadowrun6", "sheet", "actor"],
      template: "systems/shadowrun6-lw/templates/actor/actor-sheet.html",
      width: 800,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/shadowrun6-lw/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    actorData.system.biography = await this._enrichHTML(actorData.system.biography);
    //console.log(actorData.system.biography);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
      this._prepareCalculations(context);
      this._prepareSkillsForSelect(context);
      this._preapreAttributesForSelect(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  _preapreAttributesForSelect(context){
    context.attribute_selection = [];
    let ignored_attributes = ["edge","matrix_initiative","astral_initiative","initiative","essence"];

    for (let [k, s_attr] of Object.entries(context.system.attributes)) {
      if(k.includes("_mod") || ignored_attributes.includes(k)) continue;

      let v = {}
      v.key = k;
      v.label = game.i18n.localize(CONFIG.SHADOWRUN6.attributes[k]) ?? k;
      v.helpTitle = game.i18n.localize("SHADOWRUN6.AttrHelpTitle."+ k) ?? k;
      v.attr_value = parseInt(s_attr.value);
      v.attr_mod_value = parseInt(context.system.attributes[k+"_mod"].value);
      v.attr_total_value = v.attr_value + v.attr_mod_value;
      v.label_with_total_mod = v.label  + " (" + game.i18n.localize("SHADOWRUN6.Labels.DicePoolShort") + " " + v.attr_total_value + ")";
      context.attribute_selection.push(v);
    }
  }
  _prepareSkillsForSelect(context){
    context.skill_selection = []
    for(let skill of context.skills){
      let t = {}
      t.name = skill.name;
   
      t.name_with_total_mod = skill.name + " (" + game.i18n.localize("SHADOWRUN6.Labels.DicePoolShort") + " " + skill.system.skill_wp + ")";
      context.skill_selection.push(t);
    }
  }

  _prepareCalculations(context){
    // matrix actions
    let legal_skill = this._getSkillByName(context,context.actor.system.matrix.matrix_attr_legal)
    if(legal_skill){
      context.system.matrix_legal_action_dp = context.actor.system.attributes.logic.value + context.actor.system.attributes.logic_mod.value + legal_skill.system.skill_rank;
    }

    let not_legal_skill = this._getSkillByName(context,context.actor.system.matrix.matrix_attr_illegal)
    if(not_legal_skill){
      context.system.matrix_illegal_action_dp = context.actor.system.attributes.logic.value + context.actor.system.attributes.logic_mod.value + not_legal_skill.system.skill_rank;
    }

    let magic_skill = this._getSkillByName(context,context.actor.system.magic.spell_check_skill)
    if(magic_skill){
      context.system.magic_spell_check_dp = context.actor.system.attributes.magic_resonance.value + context.actor.system.attributes.magic_resonance_mod.value + magic_skill.system.skill_rank;
    }

    if(context.actor.system.magic.drain_check_skill){
      context.system.drain_check_dp = context.actor.system.attributes.willpower.value + context.actor.system.attributes.willpower_mod.value + context.actor.system.attributes[context.actor.system.magic.drain_check_skill].value
    }
  }

  _getSkillByName(context,name){
    for(let skill of context.skills){
      if (skill.name === name){
        return skill;
      }
    }
   
    return null;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.SHADOWRUN6.attributes[k]) ?? k;
      v.helpTitle = game.i18n.localize("SHADOWRUN6.AttrHelpTitle."+ k) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const skills = [];
    const gear = [];
    const augmentations = [];
    const qualities = [];
    const adept_powers = [];
    const magic_spells = [];
    const ranged_weapons = [];
    const melee_weapons = [];
    const features = [];
    const equipment_armor = [];
    const contacts = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'gear') {
        gear.push(i);
      }
      if (i.type === 'augmentation') {
        augmentations.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        skills.push(i);
      }
      else if (i.type === 'ranged_weapon') {
        ranged_weapons.push(i);
      }
      else if (i.type === 'melee_weapon') {
        melee_weapons.push(i);
      }
      else if (i.type === 'armor') {
        equipment_armor.push(i);
      }
      else if (i.type === 'contact') {
        contacts.push(i);
      }
      else if (i.type === 'quality') {
        qualities.push(i);
      }
      else if (i.type === 'adept_power') {
        adept_powers.push(i);
      }
      else if (i.type === 'magic_spell') {
        magic_spells.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.augmentations = augmentations;
    context.features = features;
    context.spells = spells;
    context.skills = skills;
    context.magic_spells = magic_spells;
    context.qualities = qualities;
    context.adept_powers = adept_powers;
    context.ranged_weapons = ranged_weapons;
    context.melee_weapons = melee_weapons;
    context.equipment_armor = equipment_armor;
    context.contacts = contacts;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Click CM Physical Click
    html.find('.cm_click_physical').click(this._onClickCmPhyisical.bind(this));

    // Click CM Stun Click
    html.find('.cm_click_stun').click(this._onClickCmStun.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.rolldialog').click(this._onRollDialog.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onClickCmPhyisical(event){
    event.preventDefault();
    const header = event.currentTarget;
    const new_value = parseInt(header.dataset.value) + 1;


    this.actor.system.cm_physical.value = new_value;
    this.actor.prepareDerivedData()
    this.render(true);
  }

  _onClickCmStun(event){
    event.preventDefault();
    const header = event.currentTarget;
    const new_value = parseInt(header.dataset.value) + 1;


    this.actor.system.cm_stun.value = new_value;
    this.actor.prepareDerivedData()
    this.render(true);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _enrichHTML(value) {
    return await TextEditor.enrichHTML(value, { async: true });
  }

  _onRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.actor.toObject(false);

    let negmod = 0;
    if(dataset.rollnegmod){
      negmod = parseInt(dataset.rollnegmod) + actorData.system.dice_pool_mod;
    }else{
      negmod = actorData.system.dice_pool_mod;
    }
    
    showSR6RollDialog(dataset.roll,dataset.label,dataset.rollposmod,negmod);
  }
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    /*if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }*/

    //console.log(dataset);

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
