# Reden Website

🌍 **Language**: [English](README.en_US.md) | [中文](README.md)

### 🎯 About Reden

Reden is a comprehensive platform for Minecraft redstone enthusiasts, providing tools, resources, and community features for sharing and creating redstone contraptions. The name "Reden" comes from "Redstone Eden" - a paradise for redstone lovers.

### ✨ Features

- **🔧 Litematica Generator**: Online generator for redstone machines like world eaters and tunnel bores
- **📋 Schematic Sharing**: Upload, share, and download litematica files
- **🎮 Minecraft Integration**: Verified Minecraft account linking with Microsoft authentication
- **🌐 Multi-language Support**: Available in English, Chinese (Simplified/Traditional), and Russian
- **👥 Community Features**: User profiles, following system, and social interactions
- **🛠️ Studio Tools**: Online litematica editor with block replacement and version conversion
- **📊 Analytics**: Download tracking and popularity metrics
- **🎨 Modern UI**: Built with Vuetify and modern web technologies

### 🛠️ Technology Stack

- **Frontend Framework**: [Nuxt 3](https://nuxt.com/) (Vue.js)
- **UI Library**: [Vuetify 3](https://vuetifyjs.com/)
- **Internationalization**: @nuxtjs/i18n for multi-language support

### 🚀 Getting Started

#### Prerequisites

- Node.js 18.x or higher
- pnpm package manager

#### Installation

1. Clone the repository:

```bash
git clone https://github.com/RedenMC/reden-website.git
cd reden-website
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open your browser and visit `http://localhost:3000`

#### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build

### 📁 Project Structure

```
├── components/          # Vue components
│   ├── layout/         # Layout components (header, footer)
│   ├── litematica/     # Litematica-related components
│   ├── profile/        # User profile components
│   └── admin/          # Admin panel components
├── pages/              # Nuxt pages (auto-routing)
├── layouts/            # Layout templates
├── middleware/         # Route middleware
├── plugins/            # Nuxt plugins
├── store/              # Pinia stores
├── utils/              # Utility functions
├── i18n/               # Internationalization files
├── assets/             # Static assets
├── public/             # Public static files
└── content/            # Content files (markdown)
```

### 📄 License

This project is open source and available under AGPL v3.

### 📞 Contact

- Discord: [Discord Server](https://discord.gg/fCxmEyFgAd)
- GitHub: [RedenMC Organization](https://github.com/RedenMC)
- Website: [redenmc.com](https://redenmc.com)
