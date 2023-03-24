/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/shadowrun6-lw/templates/actor/parts/actor-vehicle-npc.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-matrix-entity.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-attributes.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-skills.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-matrix.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-vehicle.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-magic.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-equipment.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-social.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-combat.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-skills.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-features.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-items.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-spells.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-effects.html",
    "systems/shadowrun6-lw/templates/actor/parts/actor-minion.html",
  ]);
};
