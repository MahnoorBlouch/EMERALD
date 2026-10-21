/* Privacy-conscious event hook. It sends nothing anywhere by itself.
   A future analytics script (after client approval) can listen with:
     document.addEventListener('emerald:event', function (e) { ... e.detail.name, e.detail.params ... });
   Only the whitelisted, non-personal parameters below are ever passed on. Never add phone numbers, names or form text. */
(function () {
  'use strict';
  var allowed = { placement: 1, project: 1, status: 1, field: 1 };
  window.emeraldTrack = function (name, params) {
    var clean = {};
    Object.keys(params || {}).forEach(function (k) {
      if (allowed[k] && typeof params[k] === 'string' && params[k].length <= 40) clean[k] = params[k];
    });
    document.dispatchEvent(new CustomEvent('emerald:event', { detail: { name: name, params: clean } }));
  };
})();
