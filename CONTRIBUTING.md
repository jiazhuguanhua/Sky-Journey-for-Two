# 📄 团队 Git 协作详细指南

> 本文档旨在为所有团队成员提供一份规范、系统、易于理解的 Git 分支协作流程指引。请每位成员严格遵循，以确保代码质量、减少冲突、提高协作效率。

---

## 🌳 分支模型说明

为了保证主分支的稳定性并支持多人并行开发，我们建议采用以下分支模型：

- **main 分支**：长期稳定分支，代表当前随时可上线的版本，不允许直接在此分支进行功能开发。
- **dev 分支**：开发主干分支，用于集成所有功能分支，持续更新并测试。
- **功能分支（feature 分支）**：每位开发者基于 `dev` 或 `main` 创建，用于独立开发特定功能或修复。

---

## 💡 开发流程及原因解释

### 1️⃣ 开发前务必同步主干分支

**原因**：保证你的开发基于最新版本，避免与其他人提交的代码发生冲突，防止因历史滞后导致的逻辑错误。

```bash
git checkout dev
git pull origin dev
```

### 2️⃣ 从主干分支创建独立功能分支

**原因**：保持每个功能或修复隔离，降低彼此影响，方便后续回滚或审查。

```bash
git checkout -b feature-功能名称
```

**示例**：
```bash
git checkout -b feature-login
```

### 3️⃣ 在功能分支上进行开发和提交

**原因**：所有修改仅在该功能分支上进行，避免直接影响公共分支。请提交前自测并保证可用。

```bash
# 开发、修改代码
git add .
git commit -m "✨ feat: 完成用户登录功能"
git push origin feature-login
```

### 4️⃣ 定期同步主干分支，及时解决冲突

**原因**：开发过程中，其他人可能不断向 dev 分支推送更新，如果不及时同步，最终合并时冲突会集中爆发，难以解决。

**操作流程**：
```bash
git checkout dev
git pull origin dev

git checkout feature-login
git merge dev         # 或者 git rebase dev（更推荐，历史更整洁）
```

**注意**：遇到冲突时，需立即手动解决，并通过测试确认功能不受影响。

### 5️⃣ 开发完成后发起合并请求（Pull Request）

**原因**：通过 PR 审核，确保至少一位其他成员 review 代码，减少潜在错误，保持代码质量。

**流程**：
1. 在 GitHub 上点击「New Pull Request」
2. 选择将 `feature-xxx` 合并到 `dev` 或 `main`
3. 等待至少一位同事审核，通过后合并

### 6️⃣ 合并后删除功能分支

**原因**：保持分支列表整洁，防止遗留无用分支，降低维护成本。

```bash
git branch -d feature-login
git push origin --delete feature-login
```

---

## ⚠️ 注意事项及原因

### 绝对禁止在 main 分支直接开发
✅ 保证主分支稳定、随时可上线。

### 每次开发前务必执行 git pull
✅ 避免基于旧代码修改，减少冲突与重构成本。

### 提交信息需语义化、简洁明了
✅ 便于后期回溯和理解历史更改意图。

**常用前缀建议**：
- ✨ `feat:` 新功能
- 🐛 `fix:` Bug 修复
- ♻️ `refactor:` 代码重构
- 📝 `docs:` 文档更新
- 💄 `style:` 代码格式、样式调整
- 🚑 `hotfix:` 紧急修复

### 在合并到公共分支之前，必须解决冲突并自测
✅ 保证集成后可用性，避免影响其他人工作。

---

## 🛠️ 回退操作说明

### ✅ 使用 `git revert`（推荐）
适用于已 push 到远程的提交，生成新的「撤销提交」，安全且不会影响提交历史。

```bash
git revert <commit-hash>
```

### ⚠️ 谨慎使用 `git reset`
仅适用于未 push 到远程或团队所有成员知情的情况下。若用于已 push 提交，需要强制推送，会重写远程历史，极易导致其他人本地提交丢失。

```bash
git reset --hard <commit-hash>
git push --force
```

### 💬 操作前务必沟通
所有涉及修改历史、强制推送、重大回退等高风险操作，必须先在团队群内沟通确认，确保没有成员基于旧提交继续开发。

---

## 🎯 Sky Journey for Two 项目特定流程

### 静态版（main 分支）开发流程
```bash
# 修复 Bug 或优化静态版功能
git checkout main
git pull origin main
# 修改代码...
git add .
git commit -m "🐛 fix: 修复静态版游戏Bug"
git push origin main
```

### 动态版（dev 分支）开发流程
```bash
# 开发多人游戏等新功能
git checkout dev
git pull origin dev
# 开发新功能...
git add .
git commit -m "✨ feat: 添加实时对战功能"
git push origin dev
```

### 同步修复到两个版本
```bash
# 将 main 的修复同步到 dev
git checkout dev
git merge main
git push origin dev
```

---

## ✅ 总结

🔄 **「先同步，后开发，功能隔离，审查后合并，及时清理」** 是团队 Git 协作的核心原则。

💬 严格遵守流程可有效提高协作效率，减少错误，保持代码库整洁可靠。

💪 感谢每一位成员的理解与配合，共同维护高效、专业的协作氛围！

---

## 📚 快速参考

### 常用命令
```bash
# 查看当前分支
git branch

# 查看状态
git status

# 查看差异
git diff

# 查看提交历史
git log --oneline --graph

# 创建并切换分支
git checkout -b feature-name

# 切换分支
git checkout branch-name

# 合并分支
git merge branch-name

# 删除本地分支
git branch -d branch-name

# 删除远程分支
git push origin --delete branch-name
```

### 紧急情况处理
```bash
# 撤销最后一次提交（未推送）
git reset --soft HEAD~1

# 撤销工作区修改
git checkout -- filename

# 撤销暂存区修改
git reset HEAD filename

# 查看远程仓库
git remote -v
```

---

**📞 如有疑问，请及时在团队群内沟通！**
