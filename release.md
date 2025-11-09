## 安装方式

### HACS 安装
在 HACS → **前端** → **自定义仓库** 中添加：
`https://github.com/{{ REPOSITORY }}`

### 手动安装
1. 下载 `ha-cardforge-card-{{ TAG_NAME }}.tar.gz`
2. 解压到你的 Home Assistant 配置目录的 `www/` 文件夹
3. 在 Lovelace 配置中添加资源引用：
   ```yaml
   resources:
     - url: /local/ha-cardforge-card.js
       type: module