import type { I18n } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
const messages = {
  en: {
    en: 'English',
    zh: '中文',
    reden: {
      footer: {
        reden_mod: {
          title: 'Reden Mod',
          undo_redo: 'Undo & Redo',
          rvc: 'Reden Version Control',
          debugger: 'Reden Debugger',
        },
        reden_ecosystem: {
          title: 'Reden Ecosystem',
          wiki: 'Reden Wiki',
          rvc_hub: 'RVC Hub',
          sponsors: 'Sponsors',
          github_organization: 'Github Organization',
        },
        reden_community: {
          title: 'Reden Community',
          discord: 'Discord',
          community_guidelines: 'Community Guidelines',
          community_events: 'Community Events',
        },
        follow_us: {
          title: 'Follow Us',
          blog: 'Blog',
          youtube: 'Youtube',
          bilibili: 'Bilibili',
        },
      },
      title: {
        home: 'Home',
      },
      download: 'Download',
      download_page: {
        sorry_constructing: 'Sorry, our download page is under construction, we suggest you to download at',
      },
      my_account: 'My Account',
      wiki: 'Wiki',
      description: 'Provide a one-stop working environment for redstone developers and become the best redstone debugging and teaching tool.',
    },
    user: {
      developer: 'Developer',
      developer_hover: 'This user is an active developer of this project',
      contributor: 'Contributor',
      contributor_hover: 'This user has contributed to this project',
      sponsor: 'Sponsor',
      sponsor_hover: 'This user has sponsored this project',
      staff: 'Staff',
      staff_hover: 'This user is a staff member of this project',
    },
    search: {
      hover: 'Search Reden Features',
    },
  },
  zh: {
    en: 'English',
    zh: '中文',
    reden: {
      footer: {
        reden_mod: {
          title: 'Reden Mod',
          undo_redo: '撤销 & 重做',
          rvc: 'Reden 版本控制 (RVC)',
          debugger: 'Reden 调试器',
        },
        reden_ecosystem: {
          title: 'Reden 生态系统',
          wiki: 'Reden Wiki',
          rvc_hub: 'RVC Hub',
          sponsors: '赞助者',
          github_organization: 'Github 组织',
        },
        reden_community: {
          title: 'Reden 社区',
          discord: 'Discord',
          community_guidelines: '社区指南',
          community_events: '社区活动',
        },
        follow_us: {
          title: '关注我们',
          blog: '博客',
          youtube: 'Youtube',
          bilibili: 'Bilibili',
        },
      },
      title: {
        home: '首页',
      },
      download: '下载',
      download_page: {
        sorry_constructing: '抱歉，我们的下载页面正在建设中，我们建议您前往此处下载：',
      },
      my_account: '我的账户',
      wiki: 'Wiki',
      description: '为红石机器开发者提供一站式工作环境，成为最好的红石调试和教学工具。',
    },
    user: {
      developer: '开发者',
      developer_hover: '此用户是本项目的活跃开发者',
      contributor: '贡献者',
      contributor_hover: '此用户参与过本项目的开发',
      sponsor: '赞助者',
      sponsor_hover: '此用户赞助过本项目',
      staff: '管理员',
      staff_hover: '此用户是本项目的管理员',
    },
    search: {
      hover: '搜索 Reden 功能',
    },
  },
}


export const i18n: I18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
})
