# 直播评论滚动效果

## 效果

## 使用

```json
"usingComponents": {
    "CommentsUI": "path/wx-comments/index"
  },
```

接受模板插值，插入输入框，按钮等

```xml
<CommentsUI messages="{{messages}}" bindmessagesend="onMessageSend" listWidth="100%">
  <input bindconfirm="handleConfirm"/>
  <button size='mini'>Send</button>
</CommentsUI>
```

```js
Page({
  data: {
    messages: [],
  },
  onMessageSend(){
    console.log('消息发送成功')
  }
  handleConfirm(e) {
    let msg = {
      fromNick: 'zad',
      text: '内容',
    }
    this.setData({
      messages: [msg],
    })
  },
})
```

## 参数

1. messages 必须
   需要更新的消息队列，不是所有的消息队列，而是最新的消息;
   接受一个对象数组: [msg,msg....]
   msg 的格式为

   ```json
   {
     "fromNick": "用户",
     "text": "内容"
   }
   ```

2. interval 非必须，默认为 1000ms
   消息更新的时间间隔，单位 ms
   **注意**不能少于 300ms，因为滚动动画需要时间；

3. maxLen 非必须，默认是展示所有
   展示的最多消息条数，大于此数值，组件会定期删除已经展示过的节点;
   注意：这里并不是大于长度就会立即截取，考虑到性能，而是当消息条数会超过(maxLen+10)时，取最后 maxLen 条消息

4. listWidth 非必须，默认 `100%`
   展示的消息容器宽度

5. listHeight 非必须，默认`30vh`
   展示的消息容器高度

## 事件

1. messagesend
   监听消息发送事件，发送成功的回调函数可以写在这
