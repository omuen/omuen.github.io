/*!
 * https://www.bimwook.com/
 *
 * Copyright (c) 2009 Yangbo
 *
 * Created: 2016-09-21 15:20:00 +0800
 * Revision: 1
 * 
 * Modified: 2018-07-21 09:43:00 +0800
 * 
 */

!function () {
  var film = {};
  film.create = function (container) {
    var ret = {};
    ret.container = document.getElementById(container);

    ret.items = [];
    ret.screen = null;
    ret.timer = null;

    ret.container.style.width = "100%";
    ret.container.style.position = "relative";
    ret.container.style.height = "auto";
    ret.container.style.overflow = "hidden";

    ret.indicator = {};


    ret.indicator.items = [];
    ret.indicator.current = null;
    ret.indicator.reset = function () {

      this.items = [];
      this.current = null;

      this.dom = document.createElement("ul");
      this.dom.style.margin = "0";
      this.dom.style.padding = "0";
      this.dom.style.position = "absolute";
      this.dom.style.bottom = "8px";
      this.dom.style.zIndex = "1980";
      this.dom.style.listStyleType = "none";
      this.dom.style.height = "16px";
      this.dom.innerHTML = "";
      ret.container.appendChild(this.dom);
      for (var i = 0; i < ret.items.length; i++) {
        var li = document.createElement("li");
        li.style.margin = "0 4px";
        li.style.width = "8px";
        li.style.height = "8px";
        li.style.cssFloat = "left";
        li.style.borderRadius = "1em";
        li.style.backgroundColor = "black";
        li.style.opacity = "0.5";
        this.items.push(li);
        this.dom.appendChild(li);
      }

      this.dom.style.left = Math.floor((ret.container.offsetWidth - this.dom.offsetWidth) / 2) + "px";
    }
    ret.indicator.set = function (i) {
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

    ret.init = function (screen) {
      var container = this.container;
      screen.style.position = "absolute";
      screen.style.left = "0";
      screen.style.top = "0";
      screen.style.width = "100%";
      screen.style.height = this.container.offsetHeight + "px";
    }

    ret.touch = {
      enabled: false,
      start: { x: 0, y: 0 }
    }

    ret.event = {
      "touchstart": function (evt) {
        var e = evt.touches ? evt.touches[0] : evt;
        ret.touch.enabled = true;
        ret.touch.start.x = e.clientX;
        ret.touch.start.y = e.clientY;
      },
      "touchmove": function (evt) {
        var e = evt.touches ? evt.touches[0] : evt;
        if (ret.touch.enabled) {
          var x = e.clientX;
          var dis = (x - ret.touch.start.x);
          if (dis < -40) {
            ret.next();
            ret.touch.enabled = false;
          }
          else if (dis > 40) {
            ret.prev();
            ret.touch.enabled = false;
          }
        }
      },
      "touchend": function (evt) {
        ret.touch.enabled = false;
      }
    }


    ret.add = function (url, href) {
      var container = this.container;

      var img = document.createElement("img");
      img.onclick = function () {
        window.open(href);
      }
      img.addEventListener("touchstart", this.event.touchstart, false);
      img.addEventListener("touchmove", this.event.touchmove, false);
      img.addEventListener("touchend", this.event.touchend, false);
      img.addEventListener("mousedown", this.event.touchstart, false);
      img.addEventListener("mousemove", this.event.touchmove, false);
      img.addEventListener("mouseup", this.event.touchend, false);


      img.style.position = "absolute";
      img.style.left = "0";
      img.style.top = "0";
      img.style.width = "100%";
      img.style.height = Math.floor(container.offsetWidth * 0.5625) + "px";
      img.style.display = "none";
      img.src = url;

      this.container.appendChild(img);
      this.items.push(img);
    }

    ret.interval = 3000;
    ret.current = 0;
    ret.busy = false;
    ret.onitems = {};
    ret.on = function (name, evt) {
      this.onitems[name] = evt;
    }
    ret.next = function () {
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
        var screen = me.screen;
        me.busy = true;
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

    ret.prev = function () {
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
    ret.ratio = 0.5625;
    ret.reset = function (p) {
      var container = this.container;
      if (typeof (p) == "number") {
        this.ratio = p;
      }
      this.container.style.height = Math.floor(container.offsetWidth * this.ratio) + "px";
      this.indicator.reset();
      if (this.screen) {
        this.screen.style.width = "100%";
        this.screen.style.height = this.container.offsetHeight + "px";
      }
    }

    ret.clear = function () {
      window.clearInterval(this.timer);
      this.items = [];
      this.indicator.items = [];
      this.container.innerHTML = "";
      this.screen = null;
      this.busy = false;
    }

    //ret.init();
    ret.start = function () {
      var me = this;
      this.current = 0;
      this.reset();
      this.indicator.reset();
      if (this.items.length > 0) {
        var img = this.items[0];
        img.style.display = "block";
        this.screen = img;
        this.init(img);
        this.indicator.set(0);
      }
      this.timer = window.setInterval(function () {
        if (me.busy || me.touch.enabled) return;
        me.next();
      }, this.interval);
    }

    return ret;
  }

  window.film = function (container) {
    return film.create(container);
  }
}();

