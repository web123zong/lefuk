var e = getApp(),
  t = require("./../../../utils/core.js"), a = e.requirejs("core");
Page({
  data: {
    close: 0,
    text: "",
    inphone: '',
    code: '',
  },

  // 弹框输入手机号和验证码
  pwdinput: function (e) {
    var type = e.currentTarget.dataset.type, t = this;
    if (type == 'phone') {
      t.setData({
        inphone: e.detail.value
      })
    } else {
      t.setData({
        code: e.detail.value
      })
    }
  },
  //关闭弹窗
  // closePhone: function () {
  //   this.setData({
  //     showPhone: false
  //   })
  // },
  // 点击获取验证码
  getcode: function () {
    var t = this;
    if (t.testPhone()) {
      // 请求验证码
      a.get("sms/changemobile", {
        mobile: t.data.inphone,
      }, function (e) {
        if (0 == e.error) {
          wx.showToast({
            title: '发送成功',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: e.message,
            icon: 'none'
          })
        }
      })
    }
  },

  // 验证手机号
  testPhone: function () {
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
    } else {
      return true
    }
  },

  // 点击确定
  ckeckpwd: function () {
    var t = this;
    if (t.testPhone()) {
      if (t.data.code == '') {
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
          wx.setStorageSync('mobile', o.mobile);
          t.setData({
            showPhone: false
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }
      })
    }
  },

  onLoad: function(t) {
    if (e.globalData.isjump == 1){
      this.setData({
        showPhone:false
      })
    }else{
      this.setData({
        showPhone:true
      })
    }
    this.setData({
      imgUrl: e.globalData.approot
    }), this.setData({
      close: t.close,
      text: t.text
    });
  },
  onShow: function() {
    var t = e.getCache("sysset").shopname;
    wx.setNavigationBarTitle({
      title: t || "提示"
    });
  },
  goself: function() {
    wx.switchTab({
      url: '/pages/member/index/index',
    })
  },
  bind: function() {
    var e = this,
      t = setInterval(function() {
        wx.getSetting({
          success: function(n) {
            var a = n.authSetting["scope.userInfo"];
            a && (wx.reLaunch({
              url: "/pages/index/index"
            }), clearInterval(t), console.log(a), e.setData({
              userInfo: a
            }));
          }
        });
      }, 1e3);
  },
  bindGetUserInfo: function(n) {
    var a = e.getCache("routeData"),
      o = a.url,
      s = a.params,
      i = "";
    Object.keys(s).forEach(function(e) {
      i += e + "=" + s[e] + "&";
    });
    var c = "/" + o + "?" + (s = i.substring(0, i.length - 1));
    console.log(c), wx.login({
      success: function(a) {
        t.post("wxapp/login", {
          code: a.code
        }, function(a) {
          a.error ? t.alert("获取用户登录态失败:" + a.message) : t.get("wxapp/auth", {
            data: n.detail.encryptedData,
            iv: n.detail.iv,
            sessionKey: a.session_key,
            username: wx.getStorageSync('username'),
            mobile: wx.getStorageSync('mobile'),
            credit: wx.getStorageSync('credit'),
            pwd: wx.getStorageSync('pwd'),
            verification: wx.getStorageSync('verification'),
          }, function(t) {
            1 == t.isblack && wx.showModal({
                title: "无法访问",
                content: "您在商城的黑名单中，无权访问！",
                success: function(t) {
                  t.confirm && e.close(), t.cancel && e.close();
                }
              }), n.detail.userInfo.openid = t.openId, n.detail.userInfo.id = t.id, n.detail.userInfo.uniacid = t.uniacid,
              e.setCache("userinfo", n.detail.userInfo), e.setCache("userinfo_openid", n.detail.userInfo.openid),
              e.setCache("userinfo_id", t.id), e.getSet(), wx.reLaunch({
                url: c
              });
          });
        });
      },
      fail: function() {
        t.alert("获取用户信息失败!");
      }
    });
  }
});