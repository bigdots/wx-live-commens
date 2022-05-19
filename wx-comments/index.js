import { debounce } from '../../utils/util'

Component({
  /**
   * 页面的初始数据
   */
  options: {
    pureDataPattern: /^_/, // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    commentList: [], // 显示的列表
    scrollTop: 0,
    _commentsQueue: [], // 聊天室消息队列
    _isUPdating: false, // 是否在更新聊天室内容
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
  },
  observers: {
    // 观察消息是否更新
    messages(msgs) {
      if (msgs.length <= 0) {
        return
      }

      this.setData({
        _commentsQueue: this.updateCommentsQueue(msgs),
      })
    },
    _commentsQueue: function () {
      if (!this.data._isUPdating) {
        this.setData({
          _isUPdating: true,
        })
        this.addCommentsToView()
      }
    },
  },

  lifetimes: {
    ready() {},
  },
  methods: {
    scrollToBottom: function () {
      const query = wx.createSelectorQuery()
      query.in(this).select('.comments_list').boundingClientRect()
      query.in(this).select('.commets_scroll').boundingClientRect()
      query.exec((res) => {
        if (res[0] != null && res[1] != null) {
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
        }
      })
    },
    // 动态添加评论
    addCommentsToView() {
      const commentsQueue = this.data._commentsQueue
      if (commentsQueue.length <= 0) {
        this.setData({
          _isUPdating: false,
        })
        return
      }
      const comment = commentsQueue.shift()
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
      let m = []
      for (let index = 0; index < msgs.length; index++) {
        const item = msgs[index]
        m.push(item)
        return [...this.data._commentsQueue, ...m]
      }
      return
    },
  },
})
