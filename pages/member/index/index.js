var e = getApp(),
  a = e.requirejs("core"),
  t = e.requirejs("wxParse/wxParse"),
  i = e.requirejs("biz/diypage"),
  o = e.requirejs("jquery");

Page({
  data: {
    route: "member",
    icons: e.requirejs("icons"),
    member: {},
    diypages: {},
    audios: {},
    audiosObj: {},
    modelShow: !1,
    autoplay: !0,
    interval: 5e3,
    duration: 500,
    swiperheight: 0,
    iscycelbuy: 0,
    bargain: !1,
    showPhone:false,
    inphone:'',
    code:'',
  },

  // 弹框输入手机号和验证码
  pwdinput:function(e){
    var type = e.currentTarget.dataset.type,t = this;
    if(type == 'phone'){
      t.setData({
        inphone : e.detail.value
      })
    }else{  
      t.setData({
        code :  e.detail.value  
      })
    }
  },
  //关闭弹窗
  closePhone:function(){
    this.setData({
      showPhone: false
    })
  },
  // 点击获取验证码
  getcode:function(){
    var t = this; 
    if (t.testPhone()){
      // 请求验证码
      a.get("sms/changemobile", {
        mobile: t.data.inphone,
      }, function (e) {
        if (0 == e.error){
          wx.showToast({
            title: '发送成功',
            icon: 'none'
          })
        }else{
          wx.showToast({
            title: e.message,
            icon:'none'
          })
        }
      })
    }
  },

  // 验证手机号
  testPhone:function(){
    var t = this; 
    if (t.data.inphone == '') {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false
    } else if (t.data.inphone.length != 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }else{
      return true
    }
  },

  // 点击确定
  ckeckpwd:function(){
    var t = this;
    if (t.testPhone()) {
       if(t.data.code == ''){
         wx.showToast({
           title: '请输入验证码',
           icon: 'none'
         })
         return
       } 
      //  确定请求
      var o = {
        mobile: t.data.inphone,
        code: t.data.code,
      }

      a.post("member/bind/submit", o, function (res) {
        if (0 == res.error) {
          wx.showToast({
            title: '验证成功',
            icon: 'none'
          })
          t.setData({
            showPhone: false
          })
          //去登录
          e.checkAuth()
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }
      })    
    }
  },

  onLoad: function(a) {
    // e.checkAuth(), this.setData({
    //     options: a
    // });
    this.setData({
      options: a
    });
  },
  goLogin: function () {
    if (e.globalData.isjump == ''){
      this.setData({
        showPhone: true
      })
    }
  },
  getInfo: function() {
    var e = this;
    a.get("member", {}, function(a) {
      1 == a.isblack && wx.showModal({
        title: "无法访问",
        content: "您在商城的黑名单中，无权访问！",
        success: function(a) {
          a.confirm && e.close(), a.cancel && e.close();
        }
      }), 0 != a.error ? e.setData({
        show: !0,
        nologin: 0,
      }) : e.setData({
        member: a,
        nologin: 1,
        show: !0,
        customer: a.customer,
        customercolor: a.customercolor,
        phone: a.phone,
        phonecolor: a.phonecolor,
        phonenumber: a.phonenumber,
        //iscycelbuy: a.iscycelbuy,
        bargain: a.bargain
      }), t.wxParse("wxParseData", "html", a.copyright, e, "5");
    });
  },
  onShow: function() {
    // e.checkAuth();
    var a = this;
    this.getInfo(), wx.getSystemInfo({
      success: function(e) {
        var t = e.windowWidth / 1.7;
        a.setData({
          windowWidth: e.windowWidth,
          windowHeight: e.windowHeight,
          swiperheight: t
        });
      }
    }), a.setData({
      imgUrl: e.globalData.approot
    }), i.get(this, "member", function(e) {});
  },
  onShareAppMessage: function() {
    return a.onShareAppMessage();
  },
  cancelclick: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  confirmclick: function() {
    wx.openSetting({
      success: function(e) {}
    });
  },
  phone: function() {
    var e = this.data.phonenumber + "";
    wx.makePhoneCall({
      phoneNumber: e
    });
  },
  play: function(e) {
    var a = e.target.dataset.id,
      t = this.data.audiosObj[a] || !1;
    if (!t) {
      t = wx.createInnerAudioContext("audio_" + a);
      var i = this.data.audiosObj;
      i[a] = t, this.setData({
        audiosObj: i
      });
    }
    var o = this;
    t.onPlay(function() {
      var e = setInterval(function() {
        var i = t.currentTime / t.duration * 100 + "%",
          r = Math.floor(Math.ceil(t.currentTime) / 60),
          n = (Math.ceil(t.currentTime) % 60 / 100).toFixed(2).slice(-2),
          s = Math.ceil(t.currentTime);
        r < 10 && (r = "0" + r);
        var u = r + ":" + n,
          c = o.data.audios;
        c[a].audiowidth = i, c[a].Time = e, c[a].audiotime = u, c[a].seconds = s, o.setData({
          audios: c
        });
      }, 1e3);
    });
    var r = e.currentTarget.dataset.audio,
      n = e.currentTarget.dataset.time,
      s = e.currentTarget.dataset.pausestop,
      u = e.currentTarget.dataset.loopplay;
    0 == u && t.onEnded(function(e) {
      c[a].status = !1, o.setData({
        audios: c
      });
    });
    var c = o.data.audios;
    c[a] || (c[a] = {}), t.paused && 0 == n ? (t.src = r, t.play(), 1 == u && (t.loop = !0),
      c[a].status = !0, o.pauseOther(a)) : t.paused && n > 0 ? (t.play(), 0 == s ? t.seek(n) : t.seek(0),
      c[a].status = !0, o.pauseOther(a)) : (t.pause(), c[a].status = !1), o.setData({
      audios: c
    });
  },
  pauseOther: function(e) {
    var a = this;
    o.each(this.data.audiosObj, function(t, i) {
      if (t != e) {
        i.pause();
        var o = a.data.audios;
        o[t] && (o[t].status = !1, a.setData({
          audios: o
        }));
      }
    });
  },
  onHide: function() {
    this.pauseOther();
  },
  onUnload: function() {
    this.pauseOther();
  },
  navigate: function(e) {
    var a = e.currentTarget.dataset.url,
      t = e.currentTarget.dataset.phone,
      i = e.currentTarget.dataset.appid,
      o = e.currentTarget.dataset.appurl;
    a && wx.navigateTo({
      url: a,
      fail: function() {
        wx.switchTab({
          url: a
        });
      }
    }), t && wx.makePhoneCall({
      phoneNumber: t
    }), i && wx.navigateToMiniProgram({
      appId: i,
      path: o
    });
  },
  close: function() {
    e.globalDataClose.flag = !0, wx.reLaunch({
      url: "/pages/index/index"
    });
  }
});