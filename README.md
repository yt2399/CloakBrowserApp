# CloakBrowserDesktop

<p align="center">
  <img src="./docs/images/logo.png" alt="CloakBrowserDesktop Logo" width="180" />
</p>

[English](./README.en.md) | 简体中文

CloakBrowserDesktop 是一个基于 [CloakBrowser](https://github.com/CloakHQ/CloakBrowser) 的本地浏览器环境管理与启动工具。

它将 CloakBrowser 的浏览器启动、持久化 Profile、指纹参数和代理能力整合到桌面管理界面中。用户无需编写启动代码，即可创建多个相互隔离的浏览器环境，并对环境进行统一配置、启动、停止和维护。

> 本项目适合需要长期维护多个独立浏览器环境，同时希望直接使用 CloakBrowser 能力的个人用户和研究场景。

## 功能概览

| 功能 | 说明 |
|------|------|
| 环境管理 | 创建、编辑、删除、批量启动/停止、搜索筛选 |
| 环境配置 | 代理、时区、语言、屏幕尺寸、CPU/内存、指纹种子 |
| 持久化数据 | Cookie、LocalStorage、缓存、会话状态跨启动保留 |
| 内核管理 | 按版本浏览 CloakBrowser 构建，支持镜像加速下载 |
| 远程调试 | 自动分配 CDP 端口，提供 WebSocket 地址 |
| API 接口 | 本地 HTTP API，支持脚本和第三方工具集成 |
| 代理管理 | 保存常用代理，创建环境时快速复用 |
| 多语言 | 支持中文和英文界面 |

## 功能详情

### 环境管理

通过统一列表查看和管理所有浏览器环境，支持创建、编辑、删除、批量启动/停止，以及搜索筛选。

![环境管理](./docs/images/environment-management.png)

### 环境配置

每个环境使用独立的持久化用户数据目录，Cookie、LocalStorage、缓存和会话状态可在关闭后保留。

![环境配置](./docs/images/profile-editor.png)

可配置项：名称、启动网址、代理、时区、语言、屏幕尺寸、CPU/内存、存储配额、指纹种子等。

### 内核管理

按 Chromium 版本整理 CloakBrowser 可用构建，支持镜像加速下载，提供 Windows、Linux 和 macOS 构建信息。

![内核下载](./docs/images/kernel-downloads.png)

### 远程调试 (CDP)

启动环境后自动分配远程调试端口，提供 WebSocket 地址，可直接用于自动化脚本连接浏览器。

### API 接口

内置本地 HTTP API (`http://127.0.0.1:6788`)，支持通过脚本或第三方工具控制环境的创建、启动、停止和管理。详见应用内「API 接口」页面。

## 与 CloakBrowser 的关系

CloakBrowserDesktop 不修改 CloakBrowser 内核，而是在其能力之上提供可视化的环境管理和启动入口：

- **CloakBrowser** — 浏览器内核、指纹能力与运行时
- **CloakBrowserDesktop** — 环境配置、Profile 管理、状态展示和启动控制

详细能力、支持平台和内核版本请查看 [CloakBrowser 官方项目](https://github.com/CloakHQ/CloakBrowser)。

## 许可证

本项目使用 [PolyForm Noncommercial License 1.0.0](./LICENSE)。

允许个人学习、研究、测试和其他非商业使用。商业用途需单独授权。
