'use strict';

var Request = function Request(_ref) {
  var id = _ref.id;
};

function SlotUpdate() {}

var dispatcher = {
  handle: [Request, SlotUpdate]
};

console.log(dispatcher.handle.map(function (_ref2) {
  var name = _ref2.name;
  return name;
}));

