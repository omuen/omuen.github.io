((w)=>{
  let cn = {
    table: ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=").split(""),
    map: (()=>{
      let ret = {};
      let table = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=").split("");
      for (let i = 0; i < table.length; i++) {
        ret[table[i]] = i;
      }
      ret['='] = 0;
      return ret;
    })(),
    stob(text){
      let ret = [];
      let len = text.length;
      for (let i = 0; i < len; i++) {
        let code = text.charCodeAt(i);
        if ((code > 0x0000) && (code <= 0x007F)) {
          //第一平面
          ret.push(code);
        }
        else if ((code >= 0x0080) && (code <= 0x07FF)) {
          //第一平面
          ret.push(0xC0 | ((code >> 6) & 0x1F));
          ret.push(0x80 | (code & 0x3F));
        }
        else if( ((code >= 0x0800) && (code <= 0xD7FF)) || ((code >= 0xE000) && (code <= 0xFFFF)) ){
          //第一平面
          ret.push(0xE0 | ((code >> 12) & 0x0F));
          ret.push(0x80 | ((code >> 6) & 0x3F));
          ret.push(0x80 | (code & 0x3F));
        }
        else if((code >= 0xD800) && (code <= 0xDBFF)) {
          //辅助平面
          let extra = text.charCodeAt(i+1);
          if ((extra & 0xFC00) == 0xDC00) { //0xDC00 ~ 0xDFFF
            i++;
            code = ((code & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
          }
          ret.push(0xF0 | ((code >> 18) & 0x07));
          ret.push(0x80 | ((code >> 12) & 0x3F));
          ret.push(0x80 | ((code >> 6) & 0x3F));
          ret.push(0x80 | (code & 0x3F));
        }
        else if ((code >= 0x00010000) && (code <= 0x001FFFFF)) {
        }
        else if ((code >= 0x00200000) && (code <= 0x03FFFFFF)) {
        }
        else if ((code >= 0x04000000) && (code <= 0x7FFFFFFF)) {
        }
      }
      return ret;
    },
    btos(buffer){
      let ret = [];
      let len = buffer.length;
      for (let i = 0; i < len; i++) {
        let codes = [];
        codes.push(buffer[i]);
        if (((codes[0] >> 7) & 0xFF) == 0x0) {
          // 0xxxxxxx
          ret.push(String.fromCharCode(codes[0]));
        }
        else if (((codes[0] >> 5) & 0xFF) == 0x6) {
          // 110xxxxx 10xxxxxx
          codes.push(buffer[++i]);
          let utf16 = ((codes[0] & 0x1F) << 6) | (codes[1] & 0x3F);
          ret.push(String.fromCharCode(utf16));
        }
        else if (((codes[0] >> 4) & 0xFF) == 0xE) {
          // 1110xxxx 10xxxxxx 10xxxxxx
          codes.push(buffer[++i]);
          codes.push(buffer[++i]);
          let utf16 =  ((codes[0] & 0x0F) << 12) | ((codes[1]  & 0x3F)  << 6) |  (codes[2]  & 0x3F);
          ret.push(String.fromCharCode(utf16));
        }
        else if (((codes[0] >> 3) & 0xFF) == 0x1E) {
          // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
          codes.push(buffer[++i]);
          codes.push(buffer[++i]);
          codes.push(buffer[++i]);
          let utf16 = (((codes[0] & 0x07) << 18) | ((codes[1] & 0x3F) << 12) | ((codes[2] & 0x3F) << 06) | (codes[3] & 0x3F));
          ret.push(String.fromCharCode(0xD800 | utf16 >>> 10 & 0x3F ) + String.fromCharCode(0xDC00 | utf16  & 0x3FF) );
        }
        else if (((codes[0] >> 2) & 0xFF) == 0x3E) {
          // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        }
        else if (((codes[0] >> 1) & 0xFF) == 0x7E) {
          // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        }
      }
      return ret.join('');
    },
    encode(buffer) {
      let i = 0;
      let len = buffer.length;
      let ret = [];
      while (i < len) {
        let c1 = buffer[i++];
        let h2 = i < len;
        let c2 = h2 ? buffer[i++] : 0;
        let h3 = i < len;
        let c3 = h3 ? buffer[i++] : 0;
        let e1 = c1 >>> 2;
        let e2 = ((c1 & 0x03) << 4) | (c2 >>> 4);
        let e3 = ((c2 & 0x0f) << 2) | (c3 >>> 6);
        let e4 = c3 & 0x3f;
        if (!h2) {
          e4 = e3 = 64;
        }
        else if (!h3) {
          e4 = 64;
        }
        ret.push(this.table[e1]);
        ret.push(this.table[e2]);
        ret.push(this.table[e3]);
        ret.push(this.table[e4]);
      }
      return ret.join('');
    },
    decode(text) {
      let buffer = [];
      let len = text.length;
      text += "====";
      for (let i = 0; i < len; i += 4) {
        let c1 = text.charAt(i);
        let c2 = text.charAt(i + 1);
        let c3 = text.charAt(i + 2);
        let c4 = text.charAt(i + 3);
        buffer.push(((this.map[c1] << 2) & 0xff) | (this.map[c2] >> 4));
        if (c3 != '=') buffer.push(((this.map[c2] << 4) & 0xff) | (this.map[c3] >> 2));
        if (c4 != '=') buffer.push(((this.map[c3] << 6) & 0xff) | this.map[c4]);
      }
      return buffer;
    }
  };
  Object.defineProperty(window, "Base64", {
    get(){
      return {
        encode(text){ return cn.encode(cn.stob(text)) },
        decode(data){ return cn.btos(cn.decode(data.replace(/\s/g,""))) }
      }
    }
  });
})(window);
