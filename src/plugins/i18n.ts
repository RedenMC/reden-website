import type { I18n } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
const messages = {
  en: {
    en: 'English',
    zh: '中文',
    $vuetify: {
      dataIterator: {
        rowsPerPageText: 'Items per page:',
        rowsPerPageAll: 'All',
        pageText: '{0}-{1} of {2}',
        noResultsText: 'No matching records found',
        nextPage: 'Next page',
        prevPage: 'Previous page',
      },
      dataFooter: {
        itemsPerPageText: 'Items per page:',
        itemsPerPageAll: 'All',
        pageText: '{0}-{1} items of {2}',
      },
    },
    reden: {
      learn_more: 'Learn More',
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
      home: {
        feature_intro: {
          title: 'Features',
          undo: 'Made a mistake? Reden can quickly undo your actions by just pressing Ctrl+Z. All chain reactions will be undone.',
          rvc: 'RVC (Reden Version Control) is a version control system designed for redstone. It allows you to manage your redstone projects in all versions with ease.',
          debugger:
            "Can't figure out why your redstone contraption isn't working? Reden Debugger can help you see how the game exactly processes your redstone contraption.",
        },
        community_intro: {
          title: 'Community',
          open_source:
            'Reden is an open-source project and free for everyone. We welcome everyone to contribute to Reden including code, documentation, wiki, and more.',
          rvchub:
            'RVC Hub is an official platform for redstone developers to share their RVC projects. Start sharing your knowledge and experience with the community here!',
          wiki: 'Reden Wiki contains almost everything you need to know about redstone ans Reden. It is also a great place to share your knowledge with the community.',
          discord:
            'Join our Discord server to chat with other redstone developers and get help from the community.',
          sponsor:
            'Reden is sponsored by the community. We appreciate every sponsor who supports us.',
        },
      },
      download: 'Download',
      download_page: {
        sorry_constructing:
          'Sorry, our download page is under construction, we suggest you to download at',
      },
      my_account: 'My Account',
      wiki: 'Wiki',
      description:
        'Provide a one-stop working environment for redstone developers and become the best redstone debugging and teaching tool.',
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
    sponsors: {
      title: 'Sponsors',
      description:
        'Reden is supported by you, and we are sincerely grateful to every sponsor.',
      alipay: 'Support us with Alipay',
      notice:
        'Reden is an open-source project and always free for everyone. We receive no funding from any company or organization. We rely on your support to keep the project running. When you support us, you will be listed here as a sponsor so please make sure you provide your name and email address when you donate. Thank you for your support!',
      badge:
        'You can get this Sponsor badge by supporting us, and it will be displayed on your profile.',
    },
    login: {
      title: 'Login to Reden',
      oauth: 'Or login with',
      button: {
        login: 'Login',
        captcha: 'Please complete the captcha first',
      },
    },
    register: {
      oauth: 'Or register with',
      button: {
        register: 'Register',
        captcha: 'Please complete the captcha first',
      },
    },
    search: {
      hover: 'Search Reden Features',
    },
  },
  zh: {
    en: 'English',
    zh: '中文',
    reden: {
      learn_more: '了解更多',
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
      home: {
        feature_intro: {
          title: '功能介绍',
          undo: '不小心出了错？Reden 可以通过按下 Ctrl+Z 快速撤销您的操作。所有连锁反应都将被撤销。',
          rvc: 'RVC (Reden 版本控制) 是专为红石设计的版本控制系统。它可以让您轻松管理所有版本的红石项目。',
          debugger:
            '搞不清楚为什么您的红石装置不工作？Reden 调试器可以帮助您查看游戏如何处理您的红石装置。',
        },
        community_intro: {
          title: '社区',
          open_source:
            'Reden 是一个开源项目，对所有人免费。我们欢迎所有人为 Reden 做出贡献，包括代码、文档、Wiki 等。',
          rvchub:
            'RVC Hub 是供红石开发者分享他们 RVC 项目的官方平台。在这里开始与社区分享您的知识和经验！',
          wiki: 'Reden Wiki 包含了您需要了解的关于红石和 Reden 的几乎所有内容。这也是与社区分享您的知识的好地方。',
          discord:
            '加入我们的 Discord 服务器，与其他红石开发者聊天并从社区获得帮助。',
          sponsor: 'Reden 得到了社区的赞助。我们感谢每一位支持我们的赞助者。',
        },
      },
      download: '下载',
      download_page: {
        sorry_constructing:
          '抱歉，我们的下载页面正在建设中，我们建议您前往此处下载：',
      },
      my_account: '我的账户',
      wiki: 'Wiki',
      description:
        '为红石机器开发者提供一站式工作环境，成为最好的红石调试和教学工具。',
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
    sponsors: {
      title: '赞助者',
      description: 'Reden 得到了你们的支持，我们在此由衷地感谢每一位赞助者。',
      alipay: '使用支付宝赞助',
      notice:
        'Reden 是一个开源项目，永远对所有人免费。我们没有从任何公司或组织获得资金。我们依靠您的支持来维持项目运行。当您支持我们时，您会在此页面被列出，因此请确保您在捐款时提供您的姓名和电子邮件地址。感谢您的支持！',
    },
    login: {
      title: '登录 Reden',
      oauth: '使用以下方式登录',
      button: {
        login: '登录',
        captcha: '请先完成验证码',
      },
    },
    register: {
      oauth: '使用以下方式注册',
      button: {
        register: '注册',
        captcha: '请先完成验证码',
      },
    },
    search: {
      hover: '搜索 Reden 功能',
    },
  },
};

export const i18n: I18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
});
