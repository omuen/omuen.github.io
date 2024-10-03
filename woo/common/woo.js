"use strict";
((w)=>{
  const version = "1.0";
  let web = {
    id: "1106998678468001895030322068211092689070",
    ticket: "",
    run(method, url, data, headers, blob, events){
      let meta = {
        method: method,
        headers: new Headers({ "X-With": "o-muen/1.0" }),
        body: data || null
      };
      let hds = headers || {};
      for(let n in hds){
        meta.headers.set(n, hds[n]);
      }
      if(this.ticket){
        meta.headers.set("Authorization", "Bearer " + this.ticket);
      }
      let ret = { status:0, size:0, headers:[], blob: null, text:"", error: null, data(){ try{ return JSON.parse(this.text) } catch(e){ return null} } };
      if(!blob){
        return fetch(url, meta).then(o=>{
          ret.status = o.status;
          ret.headers = o.headers;
          ret.size = (+o.headers.get("Content-Length")) || -1;
          return o.text();
        }).then(text=>{
          ret.text = text;
          return ret;
        }).catch(e=>{
          return e;
        });
      }
      else {
        let total = 0;
        let mime = "image/jpeg";
        return fetch(url, meta).then(o=>{
          ret.status = o.status;
          ret.headers = o.headers;
          ret.text = "";
          ret.size = (+o.headers.get("Content-Length")) || -1;
          mime = o.headers.get("Content-Type");
          total = (+o.headers.get("Content-Length")) || -1;
          return o.body.getReader();
        }).then(async(reader)=>{
          let received = 0;
          let chunks = [];
          let emit = typeof(events)=="function" ? events : ()=>{};
          while(true) {
            const { done, value } = await reader.read();
            if (done) {
              emit(1, received, total);
              break;
            }
            chunks.push(value);
            received = received + value.length;
            emit(0, received, total);
          }
          ret.blob = new Blob(chunks, { type: mime });
          return ret;
        }).catch(e=>{
          ret.error = { data: e };
          return ret;
        });
      }
    },
    upload(url, data, headers, events){
      return new Promise((resolve, reject)=>{
        let xhr = new XMLHttpRequest();
        let emit = typeof(events)=="function"? events : ()=>{};
        let ret = { status:0, size:0, headers:[], blob: null, text:"", error: null, data(){ try{ return JSON.parse(this.text) } catch(e){ return null} } };
        xhr.onerror = function(e){
          ret.status = -1;
          ret.error = e;
          resolve(ret);
        }
        xhr.onabort = function(){
          ret.status = -1;
          ret.error = "User-Abort";
          resolve(ret);
        }
        xhr.ontimeout = function(){
          ret.status = -1;
          ret.error = "Time-Out";
          resolve(ret);
        }
        xhr.upload.onprogress = function(ev) {
          emit(0, ev.loaded, ev.total);
        }
        xhr.onload = function(){
          let mc = (this.getAllResponseHeaders().replace(/\r/g, "")||"").match(/^([^:]*):(.*)$/igm);
          let headers = [];
          mc.map((row)=>{
            let m = row.match(/^([^:]*):(.*)$/);
            headers.push({name: m[1].trim(), value: m[2].trim() });
          });
          ret.status = this.status;
          ret.text = this.responseText;
          ret.headers = headers;
          resolve(ret);
        }
        xhr.open("POST", url, true);
        xhr.setRequestHeader("X-With","o-muen/1.0");
        let hds = headers || {};
        for(let n in hds){
          xhr.setRequestHeader(n, hds[n]);
        }
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(data||"");
      });
    },
    get(url, headers){
      return this.run("GET", url, null, headers);
    },
    post(url, data, headers){
      let hds = headers||{};
      let ct = hds["Content-Type"];
      if(!ct){
        hds["Content-Type"] = "application/x-www-form-urlencoded";
      }
      return this.run("POST", url, data, hds);
    },
    blob(url, headers, events){
      return this.run("GET", url, null, headers, true, events);
    },
    data(nv){
      let ret = {
        items: [],
        add(name, value){
          this.items.push(name + "=" + encodeURIComponent(value));
        },
        build(){
          return this.items.join("&");
        }
      };
      for(let n in nv){
        ret.add(n, nv[n]);
      }
      return ret;
    }
  };

  let hot = {
    uuid(){
      let rowid = [];
      for (let i = 0; i < 40; i++) {
        rowid.push(Math.floor(Math.random() * 10));
      }
      return rowid.join("");
    },
    now(x){
      let d = new Date();
      let ret = x;
      if (!(typeof (ret) == "string"))
      {
        ret = "yyyy-mm-dd hh:nn:ss";
      }
      return ret
        .replace(/yyyy/ig, d.getFullYear())
        .replace(/mm/ig, ("00" + (d.getMonth() + 1)).slice(-2))
        .replace(/dd/ig, ("00" + d.getDate()).slice(-2))
        .replace(/hh/ig, ("00" + d.getHours()).slice(-2))
        .replace(/nn/ig, ("00" + d.getMinutes()).slice(-2))
        .replace(/ss/ig, ("00" + d.getSeconds()).slice(-2))
        .replace(/zzz/ig, ("000" + d.getMilliseconds()).slice(-3))  
    },
    wait(interval){
      return (
        new Promise((resolve, reject)=> {
          setTimeout(()=>{resolve(true)}, interval);
        })
      ).catch(e=>{console.log(e)});
    },
    text: {
      encoder: {
        url(text){ return window.encodeURIComponent(text) },
        html(text){
          return (text||"").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&#34;").replace(/'/g, "&#39;");
        }
      },
      decoder: {
        url(text){ return window.decodeURIComponent(text) },
        html(text){
          return (text||"").replace(/&#34;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
        }
      }
    }
  };

  Object.defineProperty(window, "Web", {
    get(){ return web }
  });

  Object.defineProperty(window, "Hot", {
    get(){ return hot }
  });  
})(window);
