// Import document classes.
import { Shadowrun6Actor } from "./documents/actor.mjs";
import { Shadowrun6Item } from "./documents/item.mjs";
// Import sheet classes.
import { Shadowrun6ActorSheet } from "./sheets/actor-sheet.mjs";
import { Shadowrun6ItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import {processRollResult,_caseInsensitiveReplace} from "./helpers/roller.mjs";
import { SHADOWRUN6 } from "./helpers/config.mjs";
import {ShadowCommandHelper} from "./helpers/shadow_command_helper.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.shadowrun6 = {
    Shadowrun6Actor,
    Shadowrun6Item,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.SHADOWRUN6 = SHADOWRUN6;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@attributes.initiative.value",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = Shadowrun6Actor;
  CONFIG.Item.documentClass = Shadowrun6Item;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shadowrun6", Shadowrun6ActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("shadowrun6", Shadowrun6ItemSheet, { makeDefault: true });

  ShadowCommandHelper.install();
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === (n - 1);
      accum += block.fn(this);
  }
  return accum;
});

Handlebars.registerHelper('localizeAttribute', function(str) {
  return game.i18n.localize(SHADOWRUN6.attributes_localization_matching[str]);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  Hooks.on('chatMessage', (chatlog, message, chatData) => { 
    if (message.startsWith('/srr ')) {
      let numberOfDice =  _caseInsensitiveReplace(message, "/srr", "");
      let rollCmd = numberOfDice+"d6"
      let r = new Roll(rollCmd);
      let t= r.evaluate({async: false});
  
      chatData.content = processRollResult(t);
      chatData.roll = r;
      chatData.type =  CONST.CHAT_MESSAGE_TYPES.ROLL;
      ChatMessage.create(chatData);
      return false;
    }
    return true;
   });

   console.log(Object.keys(game.system.template.Actor.character.attributes));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.shadowrun6.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "shadowrun6.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}