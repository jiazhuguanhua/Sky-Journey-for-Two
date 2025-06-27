// 智能昵称生成器
class NicknameGenerator {
  constructor() {
    // 浪漫前缀
    this.romanticPrefixes = [
      '甜心', '宝贝', '亲爱的', '小可爱', '小天使', '小公主', '小王子',
      '蜜糖', '糖果', '棉花糖', '小星星', '小太阳', '小月亮', '小花朵',
      '温柔的', '可爱的', '迷人的', '优雅的', '活泼的', '开朗的'
    ]
    
    // 可爱词汇
    this.cuteWords = [
      '小兔子', '小猫咪', '小狐狸', '小熊猫', '小企鹅', '小海豚',
      '小鹿', '小鸟', '小鱼', '小蜜蜂', '小蝴蝶', '小松鼠',
      '樱花', '玫瑰', '百合', '向日葵', '薰衣草', '茉莉',
      '彩虹', '星光', '月光', '阳光', '微风', '雪花',
      '珍珠', '钻石', '水晶', '宝石', '翡翠', '琥珀'
    ]
    
    // 个性后缀
    this.personalitySuffixes = [
      '酱', '君', '桑', '喵', '汪', '呀', '哦', '呢',
      '小姐', '公子', '宝宝', '妹妹', '哥哥', '姐姐',
      '仙女', '王子', '公主', '天使', '精灵', '女神'
    ]
    
    // 特殊组合词
    this.specialCombos = [
      '星河守护者', '月光舞者', '彩虹追逐者', '梦境旅人',
      '时光收集者', '心跳记录者', '微笑传递者', '温暖制造者',
      '幸福配送员', '甜蜜邮递员', '快乐发明家', '爱心魔法师',
      '糖果工艺师', '彩虹画家', '星星点灯人', '花朵园丁'
    ]
    
    // 游戏相关
    this.gamingThemes = [
      '飞行大师', '棋盘冒险家', '骰子幸运儿', '胜利追求者',
      '策略家', '冒险者', '探索者', '挑战者', '勇敢者', '智慧者'
    ]
    
    // 情侣主题
    this.coupleThemes = [
      '心动时刻', '甜蜜约定', '浪漫旅程', '爱的冒险',
      '二人世界', '幸福时光', '温柔岁月', '美好回忆',
      '相伴一生', '永远在一起', '爱情故事', '甜蜜恋人'
    ]
  }

  // 随机选择数组元素
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  // 生成基础昵称
  generateBasic() {
    const prefix = this.randomChoice(this.romanticPrefixes)
    const word = this.randomChoice(this.cuteWords)
    const suffix = this.randomChoice(this.personalitySuffixes)
    
    const patterns = [
      `${prefix}${word}`,
      `${word}${suffix}`,
      `${prefix}${word}${suffix}`,
      word
    ]
    
    return this.randomChoice(patterns)
  }

  // 生成主题昵称
  generateThemed(theme = 'random') {
    switch (theme) {
      case 'gaming':
        return this.randomChoice(this.gamingThemes)
      
      case 'couple':
        return this.randomChoice(this.coupleThemes)
        
      case 'special':
        return this.randomChoice(this.specialCombos)
        
      case 'cute':
        return this.generateBasic()
        
      default:
        const themes = ['gaming', 'couple', 'special', 'cute']
        const randomTheme = this.randomChoice(themes)
        return this.generateThemed(randomTheme)
    }
  }

  // 生成带数字的昵称
  generateWithNumber() {
    const base = this.generateBasic()
    const number = Math.floor(Math.random() * 999) + 1
    
    const patterns = [
      `${base}${number}`,
      `${base}_${number}`,
      `${number}号${base}`,
      `${base}·${number}`
    ]
    
    return this.randomChoice(patterns)
  }

  // 生成情绪化昵称
  generateEmotional() {
    const emotions = [
      '开心的', '快乐的', '兴奋的', '激动的', '温柔的',
      '甜美的', '可爱的', '活泼的', '阳光的', '温暖的'
    ]
    
    const emotion = this.randomChoice(emotions)
    const word = this.randomChoice(this.cuteWords)
    
    return `${emotion}${word}`
  }

  // 生成颜色主题昵称
  generateColorful() {
    const colors = [
      '粉色', '蓝色', '紫色', '绿色', '橙色', '黄色',
      '彩虹色', '星空蓝', '樱花粉', '薄荷绿', '柠檬黄'
    ]
    
    const color = this.randomChoice(colors)
    const word = this.randomChoice(this.cuteWords)
    
    return `${color}的${word}`
  }

  // 主生成函数
  generate(options = {}) {
    const {
      type = 'random',
      includeNumber = false,
      maxLength = 12,
      minLength = 2
    } = options

    let nickname = ''
    
    // 根据类型生成昵称
    switch (type) {
      case 'basic':
        nickname = this.generateBasic()
        break
      case 'themed':
        nickname = this.generateThemed()
        break
      case 'emotional':
        nickname = this.generateEmotional()
        break
      case 'colorful':
        nickname = this.generateColorful()
        break
      case 'gaming':
        nickname = this.generateThemed('gaming')
        break
      case 'couple':
        nickname = this.generateThemed('couple')
        break
      default:
        const types = ['basic', 'themed', 'emotional', 'colorful']
        const randomType = this.randomChoice(types)
        nickname = this.generate({ ...options, type: randomType })
        break
    }
    
    // 添加数字
    if (includeNumber && Math.random() > 0.5) {
      const number = Math.floor(Math.random() * 99) + 1
      nickname += number
    }
    
    // 长度检查
    if (nickname.length > maxLength) {
      nickname = nickname.substring(0, maxLength)
    } else if (nickname.length < minLength) {
      nickname += Math.floor(Math.random() * 99) + 1
    }
    
    return nickname
  }

  // 批量生成昵称
  generateMultiple(count = 5, options = {}) {
    const nicknames = new Set()
    
    while (nicknames.size < count) {
      const nickname = this.generate(options)
      nicknames.add(nickname)
    }
    
    return Array.from(nicknames)
  }

  // 根据性别生成昵称
  generateByGender(gender = 'unisex') {
    const maleWords = [
      '王子', '骑士', '勇士', '英雄', '少年', '小哥哥',
      '阳光男孩', '帅气小生', '温柔绅士', '阳光大男孩'
    ]
    
    const femaleWords = [
      '公主', '仙女', '女神', '小姐姐', '少女', '小可爱',
      '甜美女孩', '温柔小姐', '优雅女士', '可爱小公主'
    ]
    
    switch (gender) {
      case 'male':
        return this.randomChoice(maleWords)
      case 'female':
        return this.randomChoice(femaleWords)
      default:
        return this.generate()
    }
  }

  // 根据关系生成配对昵称
  generateCouple() {
    const couplePairs = [
      ['小太阳', '小月亮'],
      ['甜心宝贝', '亲爱的'],
      ['小王子', '小公主'],
      ['阳光男孩', '甜美女孩'],
      ['温柔绅士', '可爱小姐'],
      ['勇敢骑士', '美丽公主'],
      ['小熊', '小兔'],
      ['星星', '月亮'],
      ['海洋', '天空'],
      ['春风', '夏雨']
    ]
    
    return this.randomChoice(couplePairs)
  }

  // 验证昵称
  validateNickname(nickname) {
    const issues = []
    
    if (!nickname || nickname.trim().length === 0) {
      issues.push('昵称不能为空')
    }
    
    if (nickname.length > 15) {
      issues.push('昵称过长（最多15个字符）')
    }
    
    if (nickname.length < 2) {
      issues.push('昵称过短（至少2个字符）')
    }
    
    // 检查特殊字符
    const invalidChars = /[<>\/\\|*?:"]/
    if (invalidChars.test(nickname)) {
      issues.push('昵称包含无效字符')
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }

  // 获取随机建议
  getRandomSuggestions(count = 3) {
    return this.generateMultiple(count, { type: 'random' })
  }
}

// 创建全局昵称生成器实例
const nicknameGenerator = new NicknameGenerator()

export default nicknameGenerator
