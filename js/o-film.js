/*!
 * https://bimwook.com/
 *
 * Copyright (c) 2009 Yangbo
 *
 * Created: 2009-09-21 15:20:00 +0800
 * Revision: 1
 * 
 * Modified: 2018-07-21 09:43:00 +0800
 * 
 */

!function () {
  var fn = {};
  fn.create = function (container) {
    var ret = {};
    var meta = {};
    meta.container = document.getElementById(container);
    meta.indicator = {};
    meta.items = [];
    meta.screen = null;
    meta.timer = null;

    meta.container.style.width = "100%";
    meta.container.style.position = "relative";
    meta.container.style.height = "auto";
    meta.container.style.overflow = "hidden";

    meta.indicator.items = [];
    meta.indicator.current = null;
    meta.indicator.reset = function () {

      this.items = [];
      this.current = null;

      var dom = document.createElement("ul");
      dom.style.margin = "0";
      dom.style.padding = "0";
      dom.style.position = "absolute";
      dom.style.bottom = "8px";
      dom.style.zIndex = "1980";
      dom.style.listStyleType = "none";
      dom.style.height = "16px";
      dom.innerHTML = "";
      meta.container.appendChild(dom);
      for (var i = 0; i < meta.items.length; i++) {
        var li = document.createElement("li");
        li.style.margin = "0 4px";
        li.style.width = "8px";
        li.style.height = "8px";
        li.style.cssFloat = "left";
        li.style.borderRadius = "1em";
        li.style.backgroundColor = "black";
        li.style.opacity = "0.5";
        this.items.push(li);
        dom.appendChild(li);
      }
      dom.style.left = Math.floor((meta.container.offsetWidth - dom.offsetWidth) / 2) + "px";
    }
    meta.indicator.set = function (i) {
      var item = this.items[i];
      if (this.current) {
        this.current.style.opacity = "0.5";
        this.current.style.backgroundColor = "black";
      }
      if (item) {
        item.style.backgroundColor = "white";
        item.style.opacity = "0.8";
        this.current = item;
      }
    }

    meta.init = function (screen) {
      screen.style.position = "absolute";
      screen.style.left = "0";
      screen.style.top = "0";
      screen.style.width = "100%";
      screen.style.height = meta.container.offsetHeight + "px";
    }

    meta.touch = {
      enabled: false,
      start: { x: 0, y: 0 }
    }

    meta.events = {
      "touchstart": function (evt) {
        var e = evt.touches ? evt.touches[0] : evt;
        meta.touch.enabled = true;
        meta.touch.start.x = e.clientX;
        meta.touch.start.y = e.clientY;
      },
      "touchmove": function (evt) {
        var e = evt.touches ? evt.touches[0] : evt;
        if (meta.touch.enabled) {
          var x = e.clientX;
          var dis = (x - meta.touch.start.x);
          if (dis < -40) {
            meta.next();
            meta.touch.enabled = false;
          }
          else if (dis > 40) {
            meta.prev();
            meta.touch.enabled = false;
          }
        }
      },
      "touchend": function (evt) {
        meta.touch.enabled = false;
      }
    }


    ret.add = function (url, href) {
      var container = meta.container;

      var img = document.createElement("img");
      if (href) {
        img.onclick = function () {
          window.open(href);
        }
      }
      img.addEventListener("touchstart", meta.events.touchstart, false);
      img.addEventListener("touchmove", meta.events.touchmove, false);
      img.addEventListener("touchend", meta.events.touchend, false);
      img.addEventListener("mousedown", meta.events.touchstart, false);
      img.addEventListener("mousemove", meta.events.touchmove, false);
      img.addEventListener("mouseup", meta.events.touchend, false);


      img.style.position = "absolute";
      img.style.left = "0";
      img.style.top = "0";
      img.style.width = "100%";
      img.style.height = Math.floor(container.offsetWidth * 0.5625) + "px";
      img.style.display = "none";
      img.src = url;

      container.appendChild(img);
      meta.items.push(img);
    }

    meta.interval = 3000;
    meta.current = 0;
    meta.busy = false;
    meta.onitems = {};
    ret.on = function (name, evt) {
      meta.onitems[name] = evt;
    }
    meta.next = function () {
      var me = this;
      if (this.busy) return;
      this.current++;
      if (this.current >= this.items.length) {
        this.current = 0;
        if (typeof (this.onitems['restart']) == "function") {
          this.onitems['restart']();
        }
      }
      if (this.current < this.items.length) {
        var img = this.items[this.current];
        var screen = this.screen;
        this.busy = true;
        img.style.display = "block";
        this.init(img);
        this.indicator.set(this.current);
        var t = window.setInterval(function () {
          var step = Math.abs(screen.offsetWidth + screen.offsetLeft) / 9;
          if (step < 1) {
            step = 1;
          }
          screen.style.left = (screen.offsetLeft - step) + "px";
          img.style.left = (screen.offsetLeft + screen.offsetWidth) + "px";
          if (screen.offsetLeft < -screen.offsetWidth) {
            window.clearInterval(t);
            img.style.left = "0px";
            screen.style.display = "none";
            me.screen = img;
            me.busy = false;
            if (typeof (me.onitems['next']) == "function") {
              me.onitems['next'](img);
            }
          }
        }, 20);
      }
    }

    meta.prev = function () {
      var me = this;
      if (this.busy) return;
      this.current--;
      if (this.current < 0) {
        this.current = this.items.length - 1;
      }
      if (this.current > -1) {
        var img = this.items[this.current];
        var screen = me.screen;
        me.busy = true;
        img.style.display = "block";
        this.indicator.set(this.current);
        var t = window.setInterval(function () {
          var step = Math.abs(screen.offsetWidth - screen.offsetLeft) / 9;
          if (step < 1) {
            step = 1;
          }
          screen.style.left = (screen.offsetLeft + step) + "px";
          img.style.left = (screen.offsetLeft - screen.offsetWidth) + "px";
          if (screen.offsetLeft > screen.offsetWidth) {
            window.clearInterval(t);
            img.style.left = "0px";
            screen.style.display = "none";
            me.screen = img;
            me.busy = false;
            if (typeof (me.onitems['next']) == "function") {
              me.onitems['next'](img);
            }
          }
        }, 20);
      }

    }
    var ratio = 0.5625;
    meta.reset = function (p) {
      var container = this.container;
      if (typeof (p) == "number") {
        ratio = p;
      }
      container.style.height = Math.floor(container.offsetWidth * ratio) + "px";
      meta.indicator.reset();
      if (meta.screen) {
        meta.screen.style.width = "100%";
        meta.screen.style.height = container.offsetHeight + "px";
      }
    }

    ret.clear = function () {
      window.clearInterval(meta.timer);
      meta.items = [];
      meta.indicator.items = [];
      meta.container.innerHTML = "";
      meta.screen = null;
      meta.busy = false;
    }

    ret.start = function (ratio) {
      var me = this;
      meta.current = 0;
      meta.reset(ratio || 0.5625);
      meta.indicator.reset();
      if (meta.items.length > 0) {
        var img = meta.items[0];
        img.style.display = "block";
        meta.screen = img;
        meta.init(img);
        meta.indicator.set(0);
      }
      meta.timer = window.setInterval(function () {
        if (meta.busy || meta.touch.enabled) return;
        meta.next();
      }, meta.interval);
    }

    return ret;
  }

  window.Film = function (container) {
    return fn.create(container);
  }
}();

