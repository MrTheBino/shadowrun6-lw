/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Shadowrun6Item extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }
/*
  /**
   * @override
   */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.shadowrun6 || {};
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareSkillData(itemData);
    this._prepareContactData(itemData);
  }

  _prepareContactData(itemData){
    if (itemData.type !== 'contact') return;
    const systemData = itemData.system;

    
    itemData.system.contact_check = (itemData.actor.system.attributes.charisma.value + itemData.system.influence)
    itemData.system.contact_check_mod = itemData.system.loyality
  }

  _prepareSkillData(itemData){
    if (itemData.type !== 'skill') return;
    const systemData = itemData.system;

    // auto calculate WP
    itemData.system.skill_wp = itemData.system.skill_rank;
    if(itemData.system.skill_attribute){
      itemData.system.skill_wp = itemData.system.skill_rank + itemData.actor.system.attributes[itemData.system.skill_attribute].value;
    }
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
