#!/bin/bash
# =============================================================================
# 长运行代理 - 项目初始化脚本
# =============================================================================
# 用法: ./init.sh [command]
#
# 命令:
#   start     - 启动开发服务器
#   test      - 运行测试
#   setup     - 安装依赖
#   reset     - 重置开发环境
#   status    - 检查项目状态
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    # 根据项目类型检查
    if [ -f "package.json" ]; then
        if ! command -v node &> /dev/null; then
            log_error "需要安装 Node.js"
            exit 1
        fi
        log_success "Node.js $(node -v) 已安装"
    fi

    if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
        if ! command -v python3 &> /dev/null; then
            log_error "需要安装 Python 3"
            exit 1
        fi
        log_success "Python $(python3 --version) 已安装"
    fi
}

# 安装依赖
setup() {
    log_info "安装项目依赖..."

    if [ -f "package.json" ]; then
        log_info "检测到 Node.js 项目"
        npm install
        log_success "npm 依赖安装完成"
    fi

    if [ -f "requirements.txt" ]; then
        log_info "检测到 Python 项目"
        pip install -r requirements.txt
        log_success "Python 依赖安装完成"
    fi

    if [ -f "pyproject.toml" ]; then
        log_info "检测到 Python 项目 (pyproject.toml)"
        pip install -e .
        log_success "Python 依赖安装完成"
    fi

    log_success "依赖安装完成!"
}

# 启动开发服务器
start() {
    log_info "启动开发服务器..."

    # 检查是否有自定义启动脚本
    if [ -f "scripts/start.sh" ]; then
        ./scripts/start.sh
    elif [ -f "package.json" ]; then
        npm run dev 2>/dev/null || npm start
    elif [ -f "main.py" ]; then
        python3 main.py
    elif [ -f "app.py" ]; then
        python3 app.py
    else
        log_warning "未找到启动脚本，请手动配置"
        log_info "你可以编辑 init.sh 或创建 scripts/start.sh"
    fi
}

# 运行测试
test() {
    log_info "运行测试..."

    if [ -f "package.json" ]; then
        npm test
    elif [ -f "pytest.ini" ] || [ -d "tests" ]; then
        pytest
    else
        log_warning "未找到测试配置"
    fi
}

# 检查项目状态
status() {
    echo ""
    echo "=========================================="
    echo "        项目状态检查"
    echo "=========================================="
    echo ""

    # 基本信息
    echo "📁 项目目录: $PROJECT_ROOT"
    echo ""

    # Git 状态
    if [ -d ".git" ]; then
        echo "📋 Git 状态:"
        git status -s
        echo ""
        echo "📝 最近提交:"
        git log --oneline -5
        echo ""
    else
        echo "⚠️  未初始化 Git 仓库"
    fi

    # 功能进度
    if [ -f "feature_list.json" ]; then
        echo ""
        echo "✅ 功能进度:"
        python3 -c "
import json
with open('feature_list.json') as f:
    features = json.load(f)
total = len(features)
passed = sum(1 for f in features if f.get('passes', False))
print(f'  {passed}/{total} 功能通过')
" 2>/dev/null || echo "  (无法解析 feature_list.json)"
    fi

    # 进度文件
    if [ -f "claude-progress.txt" ]; then
        echo ""
        echo "📊 最新进度 (claude-progress.txt):"
        tail -10 claude-progress.txt
    fi

    echo ""
    echo "=========================================="
}

# 重置环境
reset() {
    log_warning "这将重置开发环境!"
    read -p "确定要继续吗? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "已取消"
        exit 0
    fi

    log_info "清理依赖..."

    if [ -d "node_modules" ]; then
        rm -rf node_modules
        log_success "已删除 node_modules"
    fi

    if [ -d "__pycache__" ]; then
        rm -rf __pycache__
        log_success "已删除 __pycache__"
    fi

    if [ -d ".venv" ]; then
        rm -rf .venv
        log_success "已删除 .venv"
    fi

    log_success "环境已重置，运行 './init.sh setup' 重新安装依赖"
}

# 主入口
case "${1:-help}" in
    start)
        check_dependencies
        start
        ;;
    test)
        test
        ;;
    setup)
        check_dependencies
        setup
        ;;
    reset)
        reset
        ;;
    status)
        status
        ;;
    help|*)
        echo "用法: ./init.sh [command]"
        echo ""
        echo "命令:"
        echo "  start     启动开发服务器"
        echo "  test      运行测试"
        echo "  setup     安装依赖"
        echo "  reset     重置开发环境"
        echo "  status    检查项目状态"
        echo "  help      显示此帮助信息"
        ;;
esac
