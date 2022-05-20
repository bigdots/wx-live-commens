function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

Component({
  options: {
    pureDataPattern: /^_/, // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    commentList: [], // 显示的消息列表
    scrollTop: 0,
    commentsQueue: [], // 待展示的消息队列
    _isUPdating: false, // 是否在更新聊天室内容
    _comments: [], // 接收到的所有消息
    _index: 0, // 最新更新到的消息索引
  },
  properties: {
    messages: {
      type: Array,
      value: [],
    },

    // 消息提醒间隔事件
    interval: {
      type: Number,
      value: 1000,
    },
    // 最多展示的消息数量，过多移除
    maxLen: {
      type: Number,
      value: 50,
    },
    listWidth: {
      type: String,
      value: '100%',
    },
    listHeight: {
      type: String,
      value: '30vh',
    },
  },
  observers: {
    // 观察消息是否更新
    messages(msgs) {
      if (msgs.length <= 0) {
        return
      }

      this.setData({
        commentsQueue: this.updateCommentsQueue(msgs),
      })
    },
    commentsQueue: function () {
      if (!this.data._isUPdating) {
        this.data._isUPdating = true
        this.addCommentsToView()
      }
    },
  },

  lifetimes: {
    ready() {},
  },
  methods: {
    /**
     * 选择节点
     * @param {*} selector
     * @returns
     */
    queryNodes(selector) {
      const query = wx.createSelectorQuery()
      for (let i = 0; i < selector.length; i++) {
        const el = selector[i]
        query.in(this).select(el).boundingClientRect()
      }

      return new Promise((resolve, reject) => {
        query.exec((res) => {
          resolve(res)
        })
      })
    },
    // 更新消息滚动
    async scrollToBottom() {
      const res = await this.queryNodes(['.comments_list', '.commets_scroll'])
      if (res[0] == null || res[1] == null) {
        return
      }
      const scrollTop = res[0].height - res[1].height
      this.setData({ scrollTop: scrollTop }, () => {
        // 滚动后，判断长列表是否过长，过长则截取
        const maxLen = this.properties.maxLen
        if (this.data.commentList.length >= maxLen + 10) {
          this.setData({
            commentList: [...this.data.commentList].slice(-maxLen),
          })
        }
        // 消息展示后，添加下一条
        setTimeout(() => {
          this.addCommentsToView()
        }, this.properties.interval)
      })
    },
    // 动态添加评论到界面
    addCommentsToView() {
      let { commentsQueue, _index } = this.data
      console.debug(commentsQueue, _index)
      if (_index > commentsQueue.length - 1) {
        this.data._isUPdating = false
        return
      }
      const comment = commentsQueue[_index]
      this.data._index = _index + 1 // 更新index
      let newList = [...this.data.commentList, comment]
      this.setData(
        {
          commentList: newList,
        },
        () => {
          // 滚动到新内容
          this.scrollToBottom()
          // 自定义事件，消息更新
          this.triggerEvent('messagesend', comment)
        }
      )
    },

    preeventDefault() {
      return
    },

    /**
     * 更新评论队列
     * @param msgs
     * @returns
     */
    updateCommentsQueue(msgs) {
      msgs.forEach((element, index) => {
        msgs[index]['uuid'] = guid()
      })
      this.data.commentsQueue.push(...msgs)
      return this.data.commentsQueue
    },
  },
})
