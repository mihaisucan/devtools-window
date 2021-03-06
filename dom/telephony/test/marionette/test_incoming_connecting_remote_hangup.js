/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

MARIONETTE_TIMEOUT = 10000;

SpecialPowers.addPermission("telephony", true, document);

let telephony = window.navigator.mozTelephony;
let inNumber = "5555551111";
let incomingCall;

function verifyInitialState() {
  log("Verifying initial state.");
  ok(telephony);
  is(telephony.active, null);
  ok(telephony.calls);
  is(telephony.calls.length, 0);

  runEmulatorCmd("gsm list", function(result) {
    log("Initial call list: " + result);
    is(result[0], "OK");
    simulateIncoming();
  });
}

function simulateIncoming() {
  log("Simulating an incoming call.");

  telephony.onincoming = function onincoming(event) {
    log("Received 'incoming' call event.");
    incomingCall = event.call;
    ok(incomingCall);
    is(incomingCall.number, inNumber);
    is(incomingCall.state, "incoming");

    is(telephony.calls.length, 1);
    is(telephony.calls[0], incomingCall);

    runEmulatorCmd("gsm list", function(result) {
      log("Call list is now: " + result);
      is(result[0], "inbound from " + inNumber + " : incoming");
      is(result[1], "OK");
      answerIncoming();
    });
  };
  runEmulatorCmd("gsm call " + inNumber);
}

function answerIncoming() {
  log("Answering the incoming call.");

  incomingCall.onconnecting = function onconnecting(event) { 
    log("Received 'connecting' call event.");
    is(incomingCall, event.call);
    is(incomingCall.state, "connecting");
    // Now have the remote party hang-up the call before it is fully connected
    remoteHangUp();
  };

  incomingCall.onconnected = function onconnected(event) {
    log("Received 'connected' call event.");
  };
  incomingCall.answer();
};

function remoteHangUp() {
  log("Hanging up the incoming call (remotely) before fully connected.");

  // We get no 'disconnecting' event when remote party hangs-up the call

  incomingCall.ondisconnected = function ondisconnected(event) {
    log("Received 'disconnected' call event.");
    is(incomingCall, event.call);
    is(incomingCall.state, "disconnected");

    is(telephony.active, null);
    is(telephony.calls.length, 0);

    runEmulatorCmd("gsm list", function(result) {
      log("Call list is now: " + result);
      is(result[0], "OK");
      cleanUp();
    });
  };
  runEmulatorCmd("gsm cancel " + inNumber);
}

function cleanUp() {
  telephony.onincoming = null;
  SpecialPowers.removePermission("telephony", document);
  finish();
}

// Start the test
verifyInitialState();
