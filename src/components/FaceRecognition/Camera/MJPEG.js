// namespace MJPEG { ...
var MJPEG = (function(module) {
  'use strict';

  // class Stream { ...
  module.Stream = function(args) {
    var self = this;
    var autoStart = args.autoStart || false;

    var refreshRate = args.refreshRate || Math.round(1000 / 25);
    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(f) {
        return setTimeout(f, refreshRate);
      }; // simulate calling code 60

    var cancelAnimationFrame =
      window.cancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      function(requestID) {
        clearTimeout(requestID);
      }; //fall back

    self.url = args.url;

    self.onStart = args.onStart || null;
    self.onFrame = args.onFrame || null;
    self.onStop = args.onStop || null;
    self.callbacks = {};
    self.running = false;
    self.frameTimer = 0;

    self.img = new Image();
    self.img.setAttribute('crossOrigin', 'anonymous');
    if (autoStart) {
      self.img.onload = self.start;
    }
    self.img.src = self.url;

    function updateFrame() {
      if (self.onFrame) {
        self.onFrame(self.img);
      }
      self.frameTimer = requestAnimationFrame(updateFrame);
    }

    function setRunning(running) {
      self.running = running;
      if (self.running) {
        self.img.src = self.url;
        self.frameTimer = requestAnimationFrame(updateFrame);
        if (self.onStart) {
          self.onStart();
        }
      } else {
        self.img.src = '#';
        cancelAnimationFrame(self.frameTimer);
        if (self.onStop) {
          self.onStop();
        }
      }
    }

    self.start = function() {
      setRunning(true);
    };
    self.stop = function() {
      setRunning(false);
    };
  };

  // class Player { ...
  module.Player = function(canvas, url, options) {
    var self = this;
    if (typeof canvas === 'string' || canvas instanceof String) {
      canvas = document.getElementById(canvas);
    }
    var context = canvas.getContext('2d');

    if (!options) {
      options = {};
    }
    options.url = url;
    options.onFrame = updateFrame;
    options.onStart = function() {
      console.log('started');
    };
    options.onStop = function() {
      console.log('stopped');
    };

    self.stream = new module.Stream(options);

    canvas.addEventListener(
      'click',
      function() {
        if (self.stream.running) {
          self.stop();
        } else {
          self.start();
        }
      },
      false
    );

    function scaleRect(srcSize, dstSize) {
      var ratio = Math.min(
        dstSize.width / srcSize.width,
        dstSize.height / srcSize.height
      );
      var newRect = {
        x: 0,
        y: 0,
        width: srcSize.width * ratio,
        height: srcSize.height * ratio
      };
      newRect.x = dstSize.width / 2 - newRect.width / 2;
      newRect.y = dstSize.height / 2 - newRect.height / 2;
      return newRect;
    }

    function updateFrame(img) {
      var srcRect = {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      var dstRect = scaleRect(srcRect, {
        width: canvas.width,
        height: canvas.height
      });
      try {
        context.drawImage(
          img,
          srcRect.x,
          srcRect.y,
          srcRect.width,
          srcRect.height,
          dstRect.x,
          dstRect.y,
          dstRect.width,
          dstRect.height
        );
        // console.log('.');
      } catch (e) {
        // if we can't draw, don't bother updating anymore
        self.stop();
        console.log('!');
        throw e;
      }
    }

    self.start = function() {
      self.stream.start();
    };
    self.stop = function() {
      self.stream.stop();
    };
  };

  return module;
})(MJPEG || {});

export default MJPEG;
