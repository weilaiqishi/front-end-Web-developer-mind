# hybrid介绍

**Hybrid App(混合应用程序)**，主要原理就是将 APP 的一部分需要动态变动的内容通过 H5 来实现，通过原生的网页加载控件 WebView (Android)或 WKWebView（iOS）来加载H5页面（以后若无特殊说明，我们用 WebView 来统一指代 android 和 iOS 中的网页加载控件）。这样以来，H5 部分是可以随时改变而不用发版，动态化需求能满足；同时，由于 H5 代码只需要一次开发，就能同时在 Android 和 iOS 两个平台运行，这也可以减小开发成本，也就是说，H5 部分功能越多，开发成本就越小。我们称这种 h5+原生的开发模式为混合开发，采用混合模式开发的 APP 我们称之为混合应用或 Hybrid APP。

优点：
开发成本较低，可以跨平台，调试方便 维护成本低，功能可复用。
功能更加完善，性能和体验要比起web app好太多，更新较为自由。
缺点：
相比原生，性能仍然有较大损耗，不适用于交互性较强的app。

## App和H5通信

### App端调用H5端方法

App端调用H5端的方法，调用的必须是绑定到window对象上面的方法。

把say方法注册到window对象上。

```js
window.say = (name) => {
 alert(name)
}
```

Android调用H5端方法

```java
private void isAutoUser () {
    String username = mSpHelper.getAutoUser();
    
    if (TextUtils.isEmpty(username)) {
        return;
    }

    // 1.Android: loadUrl (Android系统4.4- 支持)
    // 该方法的弊端是无法获取函数返回值；
    // say 方法是H5端挂载在window对象上的方法。
    mWebView.loadUrl("javascript:say('" + username + "')")

    // 2.Android: evaluateJavascript (Android系统4.4+ 支持)
    // 这里着重介绍 evaluateJavascript，这也是目前主流使用的方法。
    // 该方法可以在回调方法中获取函数返回值；
    // say 方法是H5端挂载在window对象上的方法。
    mWebView.evaluateJavascript("javascript:say('" + username + "')", new ValueCallback<String>() {
        @Override
        public void onReceiveValue(String s) {
          //此处为 js 返回的结果
        }
    });
    
    // 下面这两种通信方式用的不多，这里就不着重介绍了。
    
    // 3.Android: loadUrl (Android系统4.4- 支持)
    // 直接打开某网页链接并传递参数，这种也能给H5端传递参数
    // mWebView.loadUrl("file:///android_asset/shop.html?name=" + username);
    
    // 4. Android端还可以通过重写onJsAlert, onJsConfirm, onJsPrompt方法拦截js中调用警告框，输入框，和确认框。
}
```

IOS调用H5端的方法

```swift
// Objective-C
// say 方法是H5端挂载在window对象上的方法
[self.webView evaluateJavaScript:@"say('params')" completionHandler:nil];

// Swift
// say 方法是H5端挂载在window对象上的方法
webview.stringByEvaluatingJavaScriptFromString("say('params')")
```

### H5调用Android端方法

提供给H5端调用的方法，Android 与 IOS 分别拥有对应的挂载方式。分别对应是:`苹果 UIWebview JavaScriptCore 注入（这里不介绍）`、`安卓 addJavascriptInterface 注入`、`苹果 WKWebView scriptMessageHandler 注入`。

安卓 addJavascriptInterface 注入

```java
// 这里的对象名 androidJSBridge 是可以随意更改的，不固定。
addJavascriptInterface(new MyJaveScriptInterface(mContext), "androidJSBridge");

// MyJaveScriptInterface类里面的方法
@JavascriptInterface
public aliPay (String payJson) {
  aliPayHelper.pay(payJson);
  // Android 在暴露给 H5端调用的方法能直接有返回值。
  return 'success';
}
```

H5调用Android端暴露的方法

```js
// 这里的 androidJSBridge 是根据上面注册的名字来的。
// js调用Android Native原生方法传递的参数必须是基本类型的数据，不能是引用数据类型，如果想传递引用类型需要使用JSON.stringify()。
const result = window.androidJSBridge.aliPay('string参数');
console.log(result);
```

苹果 WKWebView scriptMessageHandler 注入

```c
#pragma mark -  OC注册供JS调用的方法 register方法
- (void)addScriptFunction {
    self.wkUserContentController = [self.webView configuration].userContentController;

    [self.wkUserContentController addScriptMessageHandler:self name:@"register"];
}

#pragma mark - register方法
- (void)register:(id)body {
     NSDictionary *dict = body;
    [self.userDefaults setObject:[dict objectForKey:@"password"] forKey:[dict objectForKey:@"username"]];
    不能直接返回结果，需要再次调用H5端的方法，告诉H5端注册成功。
    [self.webView evaluateJavaScript:@"registerCallback(true)" completionHandler:nil];
}
```

ios 在暴露给 web 端调用的方法不能直接有返回值，如果需要有返回值需要再调用 web 端的方法来传递返回值。（也就是需要两步完成）。
H5调用IOS端暴露的方法。

```js
// 与android不同，ios这里的webkit.messageHandlers是固定写法，不能变。
// 不传参数
window.webkit.messageHandlers.register.postMessage(null);
// 传递参数
// 与android不同，ios这里的参数可以是基本类型和引用数据类型。
window.webkit.messageHandlers.register.postMessage(params);
```

### Android与IOS的双向通讯注意点

1. H5端调用Android端方法使用 `window.androidJSBridge.方法名(参数)` ，这里的 `androidJSBridge` 名称不固定可自定义。而H5端调用IOS端方法固定写法为 `window.webkit.messageHandlers.方法名.postMessage(参数)`。
2. H5端调用Android端方法传递的参数只能是基本数据类型，如果需要传递引用数据类型需要使用 `JSON.stringfy()` 处理。而IOS端既可以传递基本数据类型也可以传递引用数据类型。
3. H5端调用Android端方法可以直接有返回值。而IOS端不能直接有返回值。

### 统一处理

```js
/**
 * 判断手机系统类型
 * @returns phoneSys
 */
function phoneSystem() {
  var u = navigator.userAgent.toLowerCase();
  let phoneSys = ''
  if (/android|linux/.test(u)) {//安卓手机
    phoneSys = 'android'
  } else if (/iphone|ipad|ipod/.test(u)) {//苹果手机
    phoneSys = 'ios'
  } else if (u.indexOf('windows Phone') > -1) {//winphone手机
    phoneSys = 'other'
  }
  return phoneSys
}

// 调用
// 这里笔者只区分方法的调用方式，其实参数的类型和方法的返回值都需要处理。
function call(message) {
  let phoneSys = phoneSystem()
  if (typeof window.webkit != "undefined" && phoneSys == 'ios') {
    window.webkit.messageHandlers.call.postMessage(message);
  } else if (typeof jimiJS !== "undefined" && phoneSys == 'android') {
    window.jimiJS.call(message);
  }
}
```
