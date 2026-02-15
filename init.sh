#!/bin/bash
# =============================================================================
# 长运行代理 - 项目初始化脚本
# =============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 安装所有依赖
setup() {
    log_info "安装项目依赖..."

    # 后端依赖
    if [ -d "server" ]; then
        log_info "安装后端依赖..."
        cd server && npm install && npm run db:generate && cd ..
        log_success "后端依赖安装完成"
    fi

    # 前端依赖
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        log_info "安装前端依赖..."
        cd client && npm install && cd ..
        log_success "前端依赖安装完成"
    fi

    log_success "所有依赖安装完成!"
}

# 启动后端服务
start_server() {
    log_info "启动后端服务..."
    cd server && npm run dev
}

# 启动前端服务
start_client() {
    log_info "启动前端服务..."
    cd client && npm run dev
}

# 启动所有服务
start() {
    log_info "启动所有服务..."
    log_info "后端: http://localhost:3002"
    log_info "前端: http://localhost:5173"
    log_warning "请分别运行 './init.sh server' 和 './init.sh client' 启动服务"
}

# 运行测试
test() {
    log_info "运行测试..."
    if [ -d "server" ]; then
        cd server && npm test 2>/dev/null || log_warning "后端暂无测试"
    fi
}

# 检查项目状态
status() {
    echo ""
    echo "=========================================="
    echo "        项目状态检查"
    echo "=========================================="
    echo ""
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
    fi

    # 功能进度
    if [ -f "feature_list.json" ]; then
        echo "✅ 功能进度:"
        total=$(grep -c '"id"' feature_list.json 2>/dev/null || echo "0")
        passed=$(grep -c '"passes": true' feature_list.json 2>/dev/null || echo "0")
        echo "  $passed/$total 功能通过"
        echo ""
    fi

    # 进度文件
    if [ -f "claude-progress.txt" ]; then
        echo "📊 最新进度:"
        grep -A 3 "下一步" claude-progress.txt | head -4
    fi

    # 后端状态
    if [ -f "server/package.json" ]; then
        echo ""
        echo "🔧 后端状态:"
        if [ -f "data/assets.db" ]; then
            echo "  ✅ 数据库已创建"
        else
            echo "  ⚠️  数据库未创建"
        fi
        if [ -d "server/node_modules" ]; then
            echo "  ✅ 依赖已安装"
        else
            echo "  ⚠️  依赖未安装"
        fi
    fi

    echo ""
    echo "=========================================="
}

# 主入口
case "${1:-help}" in
    server)
        start_server
        ;;
    client)
        start_client
        ;;
    start)
        start
        ;;
    test)
        test
        ;;
    setup)
        setup
        ;;
    status)
        status
        ;;
    help|*)
        echo "用法: ./init.sh [command]"
        echo ""
        echo "命令:"
        echo "  server    启动后端服务"
        echo "  client    启动前端服务"
        echo "  start     显示启动说明"
        echo "  test      运行测试"
        echo "  setup     安装所有依赖"
        echo "  status    检查项目状态"
        echo "  help      显示此帮助信息"
        ;;
esac
