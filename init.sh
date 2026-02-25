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

# 获取本机局域网 IP 地址
get_lan_ip() {
    local ip=""
    # 尝试多种方式获取 IP
    if command -v hostname &> /dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    if [ -z "$ip" ] && command -v ipconfig &> /dev/null; then
        # Windows WSL
        ip=$(ipconfig 2>/dev/null | grep -E "IPv4|inet " | grep -v 127.0.0.1 | head -1 | awk '{print $NF}' | tr -d '\r')
    fi
    if [ -z "$ip" ] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    fi
    echo "$ip"
}

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

# 启动后端服务（局域网模式）
start_server_lan() {
    local lan_ip=$(get_lan_ip)
    log_info "启动后端服务（局域网模式）..."
    echo ""
    echo "=========================================="
    echo "  🌐 局域网访问地址"
    echo "=========================================="
    if [ -n "$lan_ip" ]; then
        echo "  后端 API:  http://${lan_ip}:3002/api"
        echo "  API 文档:  http://${lan_ip}:3002/api-docs"
    else
        log_warning "无法获取局域网 IP，使用 localhost"
        echo "  后端 API:  http://localhost:3002/api"
    fi
    echo "=========================================="
    echo ""
    cd server && npm run dev
}

# 启动前端服务
start_client() {
    log_info "启动前端服务..."
    cd client && npm run dev
}

# 启动前端服务（局域网模式）
start_client_lan() {
    local lan_ip=$(get_lan_ip)
    log_info "启动前端服务（局域网模式）..."
    echo ""
    echo "=========================================="
    echo "  🌐 局域网访问地址"
    echo "=========================================="
    if [ -n "$lan_ip" ]; then
        echo "  前端页面:  http://${lan_ip}:5173"
        echo ""
        log_info "手机或其他设备可通过上述地址访问"
        echo ""
    else
        log_warning "无法获取局域网 IP，使用 localhost"
        echo "  前端页面:  http://localhost:5173"
    fi
    echo "=========================================="
    echo ""
    cd client && npm run dev -- --host 0.0.0.0
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

# 数据库操作
db_push() {
    log_info "推送数据库 schema..."
    cd server && npm run db:push
    log_success "数据库 schema 已更新"
}

db_studio() {
    log_info "启动 Prisma Studio..."
    cd server && npm run db:studio
}

db_reset() {
    log_warning "这将删除所有数据！"
    read -p "确认重置数据库？(y/N) " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rm -f data/assets.db
        rm -f data/assets.db-journal 2>/dev/null || true
        cd server && npm run db:push && cd ..
        log_success "数据库已重置"
    else
        log_info "操作已取消"
    fi
}

# 数据库类型检测
db_detect() {
    log_info "检测数据库类型..."
    if [ -n "$DATABASE_URL" ]; then
        if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
            log_success "当前数据库: PostgreSQL"
            log_info "连接: ${DATABASE_URL:0:50}..."
        elif [[ "$DATABASE_URL" == file:* ]]; then
            log_success "当前数据库: SQLite"
            log_info "文件: $DATABASE_URL"
        else
            log_warning "未知数据库类型: $DATABASE_URL"
        fi
    else
        log_success "当前数据库: SQLite (默认)"
        log_info "文件: file:../data/assets.db"
    fi
}

# 迁移到 PostgreSQL
db_migrate_pg() {
    log_info "迁移数据到 PostgreSQL..."
    log_warning "请确保:"
    echo "  1. PostgreSQL 服务已启动"
    echo "  2. DATABASE_URL 环境变量已设置"
    echo "  3. 已使用 PostgreSQL schema 运行 db:push"
    echo ""
    read -p "确认开始迁移？(y/N) " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        cd server && npm run db:migrate-pg && cd ..
        log_success "数据迁移完成"
    else
        log_info "操作已取消"
    fi
}

# 构建项目
build() {
    log_info "构建后端..."
    cd server && npm run build && cd ..
    log_success "后端构建完成"

    log_info "构建前端..."
    cd client && npm run build && cd ..
    log_success "前端构建完成"

    log_success "全部构建完成!"
}

# 代码检查
lint() {
    log_info "检查后端代码..."
    cd server && npm run lint 2>/dev/null || log_warning "后端 lint 未配置" && cd ..

    log_info "检查前端代码..."
    cd client && npm run lint 2>/dev/null || log_warning "前端 lint 未配置" && cd ..

    log_success "代码检查完成"
}

# E2E 测试
e2e() {
    log_info "运行 E2E 测试..."
    npx playwright test
}

e2e_ui() {
    log_info "启动 E2E 测试 UI..."
    npx playwright test --ui
}

# Docker 命令
docker_build() {
    log_info "构建 Docker 镜像..."
    docker-compose build
    log_success "Docker 镜像构建完成"
}

docker_up() {
    log_info "启动 Docker 容器..."
    docker-compose up -d
    log_success "Docker 容器已启动"
    log_info "访问地址: http://localhost:3002"
}

docker_down() {
    log_info "停止 Docker 容器..."
    docker-compose down
    log_success "Docker 容器已停止"
}

docker_logs() {
    if [ -n "$2" ]; then
        docker-compose logs -f --tail="$2"
    else
        docker-compose logs -f --tail=100
    fi
}

docker_ps() {
    docker-compose ps
}

docker_restart() {
    log_info "重启 Docker 容器..."
    docker-compose restart
    log_success "Docker 容器已重启"
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
    server:lan)
        start_server_lan
        ;;
    client)
        start_client
        ;;
    client:lan)
        start_client_lan
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
    # 数据库操作
    db:push)
        db_push
        ;;
    db:studio)
        db_studio
        ;;
    db:reset)
        db_reset
        ;;
    db:detect)
        db_detect
        ;;
    db:migrate-pg)
        db_migrate_pg
        ;;
    # 构建和检查
    build)
        build
        ;;
    lint)
        lint
        ;;
    # E2E 测试
    e2e)
        e2e
        ;;
    e2e:ui)
        e2e_ui
        ;;
    # Docker 命令
    docker:build)
        docker_build
        ;;
    docker:up)
        docker_up
        ;;
    docker:down)
        docker_down
        ;;
    docker:logs)
        docker_logs "$@"
        ;;
    docker:ps)
        docker_ps
        ;;
    docker:restart)
        docker_restart
        ;;
    help|*)
        echo "用法: ./init.sh [command]"
        echo ""
        echo "服务命令:"
        echo "  server        启动后端服务 (port 3002)"
        echo "  server:lan    启动后端服务（局域网模式，显示局域网 IP）"
        echo "  client        启动前端服务 (port 5173)"
        echo "  client:lan    启动前端服务（局域网模式，显示局域网 IP）"
        echo "  start         显示启动说明"
        echo ""
        echo "环境命令:"
        echo "  setup         安装所有依赖"
        echo "  status        检查项目状态"
        echo ""
        echo "数据库命令:"
        echo "  db:push       推送 schema 变更到数据库"
        echo "  db:studio     打开 Prisma Studio GUI"
        echo "  db:reset      重置数据库 (删除所有数据)"
        echo "  db:detect     检测当前数据库类型"
        echo "  db:migrate-pg 迁移 SQLite 数据到 PostgreSQL"
        echo ""
        echo "测试命令:"
        echo "  test          运行后端单元测试"
        echo "  e2e           运行 E2E 测试 (Playwright)"
        echo "  e2e:ui        带 UI 的 E2E 测试"
        echo ""
        echo "构建命令:"
        echo "  build         构建前后端生产版本"
        echo "  lint          运行代码检查"
        echo ""
        echo "Docker 命令:"
        echo "  docker:build  构建 Docker 镜像"
        echo "  docker:up     启动 Docker 容器"
        echo "  docker:down   停止 Docker 容器"
        echo "  docker:logs   查看 Docker 日志 [行数]"
        echo "  docker:ps     查看 Docker 容器状态"
        echo "  docker:restart 重启 Docker 容器"
        echo ""
        echo "  help          显示此帮助信息"
        ;;
esac
