<template>
  <div>
    <el-container class="ql-layout__wrapper">
      <el-aside
        class="ql-layout__aside"
        :style="{
          width: asideWidth + 'px'
        }">
        <router-link
          class="ql-layout__logo is-waye"
          :to="{path: '/'}">
          <span class="ql-layout__logo-abbr" v-show="isCollapse">Template</span>
          <div class="ql-layout__logo-title" v-show="!isCollapse">Template</div>
        </router-link>
        <ql-menu :collapse="isCollapse"></ql-menu>
      </el-aside>
      <el-container>
        <el-header class="ql-layout__header">
          <wy-icon :name="isCollapse ? 'menu-unfold' : 'menu-fold'" @click="handleMenuToggle" class="ql-layout__header-toggle"></wy-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-if="$route.meta.title">{{$route.meta.title}}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="ql-layout__header-right">
            <el-dropdown @command="handleMessageCommand" class="ql-layout__header-dropdown">
              <span class="dropdown-link msg-prompt">
                <i class="el-icon-bell"></i>
                <el-badge :value="msgCount" v-if="msgCount">
                </el-badge>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  :key="index"
                  v-for="(item, index) in msgList"
                  :command="index">
                    {{item.message}}
                </el-dropdown-item>
                <el-dropdown-item command="empty" v-if="!msgList.length">
                  暂无消息
                </el-dropdown-item>
                <el-dropdown-item divided command="more"> 查看更多</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown @command="handleCommand" class="ql-layout__header-dropdown">
              <span class="dropdown-link">
                <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
                {{userName}}
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="pwd"><wy-icon name="lock"></wy-icon> 修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout"><wy-icon name="logout"></wy-icon> 注销</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="ql-layout__main">
          <multi-tab></multi-tab>
          <div class="ql-layout__content">
            <slot></slot>
          </div>
        </el-main>
        <el-footer height="30px" class="ql-layout__footer">
          mapbar_front 个人模板项目
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '@/utils/event-bus'
import MultiTab from '@/components/multi-tab'
import QlMenu from './menu'
const ASIDE_WIDTH_MINI = 64
const ASIDE_WIDTH_FULL = 230
export default {
  name: 'PageLayout',
  components: {
    QlMenu,
    MultiTab
  },
  data () {
    return {
      msgTimer: null,
      isCollapse: false,
      msgCount: 3,
      msgId: null,
      msgData: {
        readTime: '',
        status: null,
        processTime: ''
      },
      msgList: [],
      // isNw: typeof window.nw !== 'undefined',
      transitionName: 'slide-left'
    }
  },

  computed: {
    ...mapGetters(['userName', 'userCode', 'pwdStyle']),

    asideWidth () {
      return this.isCollapse ? ASIDE_WIDTH_MINI : ASIDE_WIDTH_FULL
    }
  },

  mounted () {
    EventBus.$on('ql.logout.success', () => {
      this.clearTimer()
    })

    this.autoUpdateMessage()

    EventBus.$on('ql.message.showDialog', data => {
      this.updateCurrMsg(data)
      this.showDialogMessage = true
    })
  },

  beforeDestroy () {
    this.clearTimer()
  },

  methods: {
    clearTimer () {
      this.msgTimer && clearInterval(this.msgTimer)
    },
    fetchMessage () {

    },
    autoUpdateMessage () {
      this.fetchMessage()
      this.msgTimer = setInterval(() => {
        this.fetchMessage()
      }, 15 * 1000)
    },
    handleMsgUpdate () {
      this.fetchMessage()
      EventBus.$emit('ql.message.refresh')
    },
    handleMenuToggle () {
      this.isCollapse = !this.isCollapse
    },
    handleMenuOpen () {
      this.asideWidth = ASIDE_WIDTH_FULL
    },
    handleMenuClose () {
      this.asideWidth = ASIDE_WIDTH_MINI
    },
    handleMessageCommand (cmd) {
      if (cmd === 'empty') return
      if (cmd === 'more') {
        this.$router.push({ path: '/message-mgr/message' })
      } else {
        let msg = this.msgList[cmd]
        this.updateCurrMsg(msg)
        this.showDialogMessage = true
      }
    },
    updateCurrMsg (data) {
      this.msgId = data.id
      this.msgData.processTime = data.processTime
      this.msgData.readTime = data.readTime
      this.msgData.status = data.status
    },
    handleCommand (cmd) {
      if (cmd === 'logout') {
        this.$store.dispatch('logout').then(() => {
          this.clearTimer()
          // this.goLogin()
          this.$router.replace({ name: 'login' })
          window.location.reload(true)
        })
      } else if (cmd === 'pwd') {
        this.showDialogReset = true
      }
    },
    goLogin () {
      let { protocol, host, pathname } = window.location
      window.location.href = `${protocol}//${host}${pathname}#/login`
    }
  }
}
</script>
<style lang="less">
  body {
    margin: 0;
    padding: 0;
  }

  html,
  #app,
  body,
  .ql-layout__wrapper,
  .ql-layout__aside {
    height: 100vh;
  }

  .ql-layout {
    &__logo {
      display: block;
      height: 60px;
      overflow: hidden;
      line-height: 60px;
      background: #002140;

      &-title {
        display: inline-block;
        margin: 0 0 0 18px;
        color: #fff;
        font-weight: 550;
        font-size: 16px;
        vertical-align: middle;

        strong {
          font-size: 24px;
        }
      }

      &-abbr {
        display: inline-block;
        width: 64px;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 60px;
        text-align: center;
      }
    }

    &__header {
      position: relative;
      align-items: center;
      padding: 0;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

      &-toggle {
        float: left;
        padding: 0 24px;
        font-size: 24px;
        line-height: 60px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .el-breadcrumb {
        line-height: 60px;
      }

      .el-breadcrumb__item:last-child .el-breadcrumb__inner {
        font-size: 16px;
      }

      &-right {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;

        .el-badge__content {
          border: 0;

          &.is-fixed {
            top: 50%;
            transform: translateY(-100%) translateX(100%);
          }
        }
      }

      &-dropdown {
        .dropdown-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          height: 60px;
          padding: 0 12px;
          line-height: 60px;
          cursor: pointer;
          transition: all 0.3s;

          .el-avatar {
            margin-right: 8px;
          }

          &.msg-prompt {
            // position: relative;
            // // line-height: 60px;
            // width: 40px;
            // text-align: center;
            // height: 60px;
            // top: 0;
            i {
              font-size: 18px;
            }

            .el-badge {
              vertical-align: top;
            }
          }

          &:hover {
            // background: $--color-primary-light-7;
          }
        }
      }
    }

    &__submenu {
      .el-menu {
        background: #000c17;

        &-item {
          &:hover {
            color: #fff !important;
          }

          &.is-active {
            color: #fff;
            background: #188fff !important;
          }
        }
      }

      & .el-submenu {
        &.is-active {
          & .el-submenu__title {
            background: #188fff !important;
          }
        }

        &__title {
          &:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }

          & i {
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }

    &__aside {
      position: relative;
      z-index: 10;
      overflow: visible;
      background: #000c17;
      box-shadow: 2px 0 6px rgba(5, 55, 102, 0.35);
      transition: width 0.3s;

      &-menu {
        height: calc(100% - 60px);
        overflow-y: auto;
      }

      &-empty {
        padding: 20px 0 0 20px;
        color: #f2f2f2;

        &.is-collapse {
          padding: 5px 0 0 3px;
        }
      }

      .el-menu {
        border: none;

        .wyicon {
          margin-right: 4px;
        }

        .el-menu-item {
          background: #000c17;

          &:hover {
            color: #fff !important;
          }
        }

        .el-submenu:hover,
        .el-submenu__title:hover {
          color: #fff !important;
        }

        .el-submenu.is-active,
        .el-menu-item.is-active {
          color: #fff !important;
          background-color: #188fff !important;
        }
      }

      .el-menu-item i {
        color: rgba(255, 255, 255, 0.9);
      }

      .el-submenu {
        &.is-active {
          background: #037dc8;

          &.is-opened {
            background: #037dc8;
          }
        }

        i {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .footer {
        position: absolute;
        bottom: 12px;
        left: 10px;
        color: rgba(255, 255, 255, 0.5);
      }
    }

    &__main {
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    &__content {
      flex: 1;
      padding: 20px;
      background: #f0f2f5;
    }

    &__footer {
      color: #409eff;
      line-height: 30px;
      text-align: center;
      background: #f0f2f5;
    }
  }

  .el-tooltip__popper {
    max-width: 400px;
  }
</style>
