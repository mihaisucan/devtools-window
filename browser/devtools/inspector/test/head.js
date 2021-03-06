/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cu = Components.utils;
let tempScope = {};
Cu.import("resource:///modules/devtools/LayoutHelpers.jsm", tempScope);
let LayoutHelpers = tempScope.LayoutHelpers;

// Import the GCLI test helper
let testDir = gTestPath.substr(0, gTestPath.lastIndexOf("/"));
Services.scriptloader.loadSubScript(testDir + "/helpers.js", this);

// Clear preferences that may be set during the course of tests.
function clearUserPrefs()
{
  Services.prefs.clearUserPref("devtools.inspector.sidebarOpen");
  Services.prefs.clearUserPref("devtools.inspector.activeSidebar");
}

registerCleanupFunction(clearUserPrefs);

function openInspector(callback)
{
  let tab = gBrowser.selectedTab;
  let inspector = gDevTools.getPanelForTarget("inspector", tab);
  if (inspector && inspector.isReady) {
    callback(inspector);
  } else {
    let toolbox = gDevTools.openToolForTab("inspector", tab);
    toolbox.once("inspector-ready", function(event, panel) {
      let inspector = gDevTools.getPanelForTarget("inspector", tab);
      callback(inspector);
    });
  }
}

function getActiveInspector()
{
  let tab = gBrowser.selectedTab;
  return gDevTools.getPanelForTarget("inspector", tab);
}

function isHighlighting()
{
  let outline = getActiveInspector().highlighter.outline;
  return !(outline.getAttribute("hidden") == "true");
}

function getHighlitNode()
{
  let h = getActiveInspector().highlighter;
  if (!isHighlighting() || !h._contentRect)
    return null;

  let a = {
    x: h._contentRect.left,
    y: h._contentRect.top
  };

  let b = {
    x: a.x + h._contentRect.width,
    y: a.y + h._contentRect.height
  };

  // Get midpoint of diagonal line.
  let midpoint = midPoint(a, b);

  return LayoutHelpers.getElementFromPoint(h.win.document, midpoint.x,
    midpoint.y);
}


function midPoint(aPointA, aPointB)
{
  let pointC = { };
  pointC.x = (aPointB.x - aPointA.x) / 2 + aPointA.x;
  pointC.y = (aPointB.y - aPointA.y) / 2 + aPointA.y;
  return pointC;
}

/* FIXME
function computedView()
{
  return InspectorUI.sidebar._toolContext("computedview");
}

function computedViewTree()
{
  return computedView().view;
}

function ruleView()
{
  return InspectorUI.sidebar._toolContext("ruleview").view;
}
*/

function synthesizeKeyFromKeyTag(aKeyId) {
  let key = document.getElementById(aKeyId);
  isnot(key, null, "Successfully retrieved the <key> node");

  let modifiersAttr = key.getAttribute("modifiers");

  let name = null;

  if (key.getAttribute("keycode"))
    name = key.getAttribute("keycode");
  else if (key.getAttribute("key"))
    name = key.getAttribute("key");

  isnot(name, null, "Successfully retrieved keycode/key");

  let modifiers = {
    shiftKey: modifiersAttr.match("shift"),
    ctrlKey: modifiersAttr.match("ctrl"),
    altKey: modifiersAttr.match("alt"),
    metaKey: modifiersAttr.match("meta"),
    accelKey: modifiersAttr.match("accel")
  }

  EventUtils.synthesizeKey(name, modifiers);
}
