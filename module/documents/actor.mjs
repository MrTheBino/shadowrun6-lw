/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Shadowrun6Actor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.shadowrun6 || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    this._prepareVehicleNpcData(actorData);
    this._prepareMatrixEntityData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    systemData.dice_pool_mod = 0;
    if (systemData.cm_physical.value > 0){
      systemData.dice_pool_mod =  Math.floor(((systemData.cm_physical.value - systemData.cm_physical.max) * -1) / 3);
    }
    if (systemData.cm_stun.value > 0){
      systemData.dice_pool_mod +=  Math.floor(((systemData.cm_stun.value - systemData.cm_stun.max) * -1) / 3);
    }
    
    // defense data
    systemData.defense_check = (systemData.attributes.reaction.value + systemData.attributes.reaction_mod.value + systemData.attributes.intuition.value + systemData.attributes.intuition_mod.value)

    // attribute modifiers
    systemData.attr_body_total =  systemData.attributes.body.value + systemData.attributes.body_mod.value;
    systemData.attr_agility_total =  systemData.attributes.agility.value + systemData.attributes.agility_mod.value;
    systemData.attr_magic_resonance_total = systemData.attributes.magic_resonance.value + systemData.attributes.magic_resonance_mod.value;
    systemData.attr_reaction_total = systemData.attributes.reaction.value + systemData.attributes.reaction_mod.value;
    systemData.attr_strength_total = systemData.attributes.strength.value + systemData.attributes.strength_mod.value;
    systemData.attr_willpower_total = systemData.attributes.willpower.value + systemData.attributes.willpower_mod.value;
    systemData.attr_logic_total = systemData.attributes.logic.value + systemData.attributes.logic_mod.value;
    systemData.attr_composure_total = systemData.attributes.composure.value + systemData.attributes.composure_mod.value;
    systemData.attr_intuition_total = systemData.attributes.intuition.value + systemData.attributes.intuition_mod.value;
    systemData.attr_judge_intentions_total = systemData.attributes.judge_intentions.value + systemData.attributes.judge_intentions_mod.value;
    systemData.attr_charisma_total = systemData.attributes.charisma.value + systemData.attributes.charisma_mod.value;
    systemData.attr_memory_total = systemData.attributes.memory.value + systemData.attributes.memory_mod.value;
    systemData.attr_lift_carry_total = systemData.attributes.lift_carry.value + systemData.attributes.lift_carry_mod.value;
    systemData.attr_unarmed_ar_total = systemData.attributes.unarmed_ar.value + systemData.attributes.unarmed_ar_mod.value;
    systemData.attr_defense_rating_total = systemData.attributes.defense_rating.value + systemData.attributes.defense_rating_mod.value;
    
    
    // Loop through ability scores, and add their modifiers to our sheet output.
    /*for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }*/
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    const systemData = actorData.system;
    // Make modifications to data here. For example:
    systemData.dice_pool_mod = 0;
    if (systemData.cm_physical.value > 0){
      systemData.dice_pool_mod =  Math.floor(((systemData.cm_physical.value - systemData.cm_physical.max) * -1) / 3);
    }
    if (systemData.cm_stun.value > 0){
      systemData.dice_pool_mod +=  Math.floor(((systemData.cm_stun.value - systemData.cm_stun.max) * -1) / 3);
    }

    // defense data
    systemData.defense_check = (systemData.attributes.reaction.value + systemData.attributes.intuition.value)
  }

  _prepareMatrixEntityData(actorData){
    if (actorData.type !== 'matrix_entity') return;

    const systemData = actorData.system;
    systemData.defense_rating = systemData.attributes.data_processing.value + systemData.attributes.firewall.value;
    systemData.attack_rating = systemData.attributes.attack.value + systemData.attributes.sneak.value;
  }

  _prepareVehicleNpcData(actorData) {
    if (actorData.type !== 'vehicle') return;

    const systemData = actorData.system;
    // Make modifications to data here. For example:
    systemData.dice_pool_mod = 0;
    if (systemData.cm_physical.value > 0){
      systemData.dice_pool_mod =  Math.floor(((systemData.cm_physical.value - systemData.cm_physical.max) * -1) / 3);
    }
    if (systemData.cm_stun.value > 0){
      systemData.dice_pool_mod +=  Math.floor(((systemData.cm_stun.value - systemData.cm_stun.max) * -1) / 3);
    }

    // defense data
    //systemData.defense_check = (systemData.attributes.reaction.value + systemData.attributes.intuition.value)
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);
    this._getVehicleNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.attributes) {
      for (let [k, v] of Object.entries(data.attributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    //console.log(data);

    // Add level for easier access, or fall back to 0.
    /*if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }*/
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  _getVehicleNpcRollData(data){
    if (this.type !== 'vehicle') return;
  }

}