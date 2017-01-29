(function () {
  angular
    .module('ng-scroll-bar')
    .directive('ngScrollBar', ngScrollBarDirective);

  /* @ngInject */
  function ngScrollBarDirective($window, $timeout) {

    function link(scope, element, attrs, controllers) {

      const minThumbsize = 8;
      let initial = true, isUpdating = false, w = angular.element($window),
        isMouseDownX = false, isMouseDownY = false, mouseDownX, mouseDownY, mouseDownScrollTop, mouseDownScrollLeft;

      const thumbY = angular.element('<div class="ng-scroll-bar-thumb-y"></div>');
      const thumbX = angular.element('<div class="ng-scroll-bar-thumb-x"></div>');

      element.append(thumbY);
      element.append(thumbX);

      // define a new observer
      // shim with MutationObserver
      const observer = new MutationObserver(function (mutations, observer) {
        if (initial) {
          initial = false;
          update();
        }
        mutations.some((item) => {
          if (item.target !== thumbY[0] && item.target !== thumbX[0]) {
            update();
            return true;
          }
        });
      });

      element.on('scroll', update);
      element.on('mousewheel', mousewheel);
      thumbY.on('DOMMouseScroll', mousewheel);
      thumbY.on('mousedown', mousedown);
      thumbX.on('DOMMouseScroll', mousewheel);
      thumbX.on('mousedown', mousedown);
      w.on('resize', update);

      // have the observer observe foo for changes in children
      observer.observe(element[0], { attributes: true, childList: true, subtree: true, characterData: true });

      scope.$on('$destroy', function () {
        listener.disconect();
        element.off('scroll', update);
        element.off('mousewheel', mousewheel);
        thumbY.off('DOMMouseScroll', mousewheel);
        thumbY.off('mousedown', mousedown);
        thumbX.off('DOMMouseScroll', mousewheel);
        thumbX.off('mousedown', mousedown);
        w.off('mouseup', mouseup);
        w.off('mousemove', mousemove);
        w.off('resize', update);
      });

      $timeout(update, 100);

      function mousewheel(e) {
        if (event.deltaY) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const scrollHeight = element[0].scrollHeight;
          const scrollTop = element[0].scrollTop;
          element[0].scrollTop = Math.min(scrollHeight, scrollTop + event.deltaY);
        }
      }

      function mousedown(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.target == thumbY[0]) {
          isMouseDownY = true;
          mouseDownY = e.screenY;
          mouseDownScrollTop = element[0].scrollTop;
          w.on('mouseup', mouseup);
          w.on('mousemove', mousemove);
        } else if (e.target == thumbX[0]) {
          isMouseDownX = true;
          mouseDownX = e.screenX;
          mouseDownScrollLeft = element[0].scrollLeft;
          w.on('mouseup', mouseup);
          w.on('mousemove', mousemove);
        }
      }

      function mouseup() {
        isMouseDownX = false;
        isMouseDownY = false;
        w.off('mouseup', mouseup);
        w.off('mousemove', mousemove);
      }

      function mousemove(e) {
        e.preventDefault();
        if (isMouseDownY) {
          const clientHeight = element[0].clientHeight;
          const scrollHeight = element[0].scrollHeight;
          const displacementY = e.screenY - mouseDownY;
          const spaceHeight = clientHeight - (clientHeight / scrollHeight);
          const thumbYPosition = (mouseDownScrollTop / scrollHeight * spaceHeight) + displacementY;
          const scrollTop = thumbYPosition / spaceHeight * scrollHeight;
          if (scrollTop > scrollHeight) {
            element[0].scrollTop = scrollHeight;
          } else {
            element[0].scrollTop = scrollTop;
          }
        } else if (isMouseDownX) {
          const clientWidth = element[0].clientWidth;
          const scrollWidth = element[0].scrollWidth;
          const displacementX = e.screenX - mouseDownX;
          const spaceWidth = clientWidth - (clientWidth / scrollWidth);
          const thumbXPosition = (mouseDownScrollLeft / scrollWidth * spaceWidth) + displacementX;
          const scrollLeft = thumbXPosition / spaceWidth * scrollWidth;
          if (scrollLeft > scrollWidth) {
            element[0].scrollLeft = scrollWidth;
          } else {
            element[0].scrollLeft = scrollLeft;
          }
        }
      }

      function update(updateX = true, updateY = true) {
        if (isUpdating) return;
        isUpdating = true;
        //$window.setTimeout(() => {
        const clientHeight = element[0].clientHeight;
        const scrollHeight = element[0].scrollHeight;
        const clientWidth = element[0].clientWidth;
        const scrollWidth = element[0].scrollWidth;

        if (clientHeight == scrollHeight) {
          element[0].scrollTop = 0;
          thumbY[0].style.opacity = 0;
          thumbY[0].style.pointerEvents = 'none';
        } else {
          const scrollTop = element[0].scrollTop;
          const scrollLeft = element[0].scrollLeft;
          const thumbYHeight = clientHeight / scrollHeight;
          const spaceHeight = clientHeight - (clientHeight / scrollHeight);
          const thumbYPosition = scrollTop / scrollHeight * spaceHeight;
          //Updating
          thumbY[0].style.pointerEvents = 'all';
          thumbY[0].style.opacity = '';
          thumbY[0].style.height = `${thumbYHeight * 100}%`;
          thumbY[0].style.top = `${(scrollTop + thumbYPosition)}px`;
          thumbY[0].style.right = `${-scrollLeft}px`;
        }

        if (clientWidth == scrollWidth) {
          element[0].scrollLeft = 0;
          thumbX[0].style.opacity = 0;
          thumbX[0].style.pointerEvents = 'none';
        } else {
          const scrollLeft = element[0].scrollLeft;
          const scrollTop = element[0].scrollTop;
          const thumbWidth = clientWidth / scrollWidth;
          const spaceWidth = clientWidth - (clientWidth / scrollWidth);
          const thumbXPosition = scrollLeft / scrollWidth * spaceWidth;
          //Updating
          thumbX[0].style.pointerEvents = 'all';
          thumbX[0].style.opacity = '';
          thumbX[0].style.width = `${thumbWidth * 100}%`;
          thumbX[0].style.left = `${(scrollLeft + thumbXPosition)}px`;
          thumbX[0].style.bottom = `${-scrollTop}px`;
        }
        isUpdating = false;
        //}, 0);
      }
    }

    return {
      restrict: 'A',
      bindings: {},
      controller: angular.noop,
      link,
    };

  }

} ())