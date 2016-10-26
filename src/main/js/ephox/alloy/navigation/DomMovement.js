define(
  'ephox.alloy.navigation.DomMovement',

  [
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Direction',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Class, Direction, Focus, SelectorFind) {
    // Looks up direction (considering LTR and RTL), finds the focused element,
    // and tries to move. If it succeeds, triggers focus and kills the event.
    var useH = function (movement) {
      return function (component, simulatedEvent, info) {
        var move = movement(component.element());
        return use(move, component, simulatedEvent, info);
      };
    };

    var west = function (moveLeft, moveRight) {
      var movement = Direction.onDirection(moveLeft, moveRight);
      return useH(movement);
    };

    var east = function (moveLeft, moveRight) {
      var movement = Direction.onDirection(moveRight, moveLeft);
      return useH(movement);
    };

    var useV = function (move) {
      return function (component, simulatedEvent, info) {
        return use(move, component, simulatedEvent, info);
      };
    };

    var getFocused = function (component, info) {
      return info.fakeClass().fold(function () {
        return Focus.search(component.element());
      }, function (fc) {
        return SelectorFind.descendant(component.element(), '.' + fc);
      });
    };

    var use = function (move, component, simulatedEvent, info) {
      console.log('info', info);

      var outcome = getFocused(component, info).bind(function (focused) {
        return move(component.element(), focused, info).map(function (newFocus) {
          return {
            original: focused,
            nu: newFocus
          };
        });
      });

      return outcome.map(function (focuses) {
        info.fakeClass().fold(function () {
          component.getSystem().triggerFocus(focuses.nu, component.element());  
        }, function (fc) {
          Class.remove(focuses.original, fc);
          Class.add(focuses.nu, fc);
        });
        return true;
      });
    };

    return {
      east: east,
      west: west,
      north: useV,
      south: useV,
      move: useV
    };
  }
);